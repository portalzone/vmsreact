# Security Policy

## Overview

The VMS (Vehicle Management System) takes security seriously. This document outlines our security policies, best practices, and how to report vulnerabilities.

**Version:** 1.0  
**Last Updated:** December 21, 2024

---

## Table of Contents

1. [Supported Versions](#supported-versions)
2. [Security Features](#security-features)
3. [Authentication & Authorization](#authentication--authorization)
4. [Data Protection](#data-protection)
5. [Input Validation](#input-validation)
6. [File Upload Security](#file-upload-security)
7. [API Security](#api-security)
8. [Database Security](#database-security)
9. [Session Management](#session-management)
10. [HTTPS/SSL](#httpsssl)
11. [Security Headers](#security-headers)
12. [Rate Limiting](#rate-limiting)
13. [Logging & Monitoring](#logging--monitoring)
14. [Reporting Vulnerabilities](#reporting-vulnerabilities)
15. [Security Best Practices](#security-best-practices)
16. [Compliance](#compliance)

---

## Supported Versions

| Version | Supported | Security Updates |
|---------|-----------|------------------|
| 1.x     | ✅ Yes    | Active           |
| < 1.0   | ❌ No     | Not supported    |

We provide security updates for the current major version only.

---

## Security Features

### Built-in Security Features

✅ **Authentication**
- Laravel Sanctum for API authentication
- Secure token-based auth
- Password hashing with bcrypt
- Token expiration

✅ **Authorization**
- Role-based access control (RBAC)
- Spatie Permission package
- Policy-based authorization
- Fine-grained permissions

✅ **Data Protection**
- SQL injection prevention (Eloquent ORM)
- XSS protection
- CSRF protection
- Mass assignment protection

✅ **Encryption**
- Database encryption for sensitive data
- Password hashing
- Secure token generation
- HTTPS/TLS encryption

✅ **Validation**
- Server-side input validation
- File upload validation
- Request validation
- Sanitization

---

## Authentication & Authorization

### Password Requirements

**Minimum Requirements:**
- Length: 8 characters minimum
- Complexity: Mix of uppercase, lowercase, numbers recommended
- Hashing: bcrypt (Laravel default)

**Implementation:**
```php
// app/Http/Requests/Auth/RegisterRequest.php
public function rules()
{
    return [
        'password' => [
            'required',
            'string',
            'min:8',
            'confirmed',
            Password::min(8)
                ->mixedCase()
                ->numbers()
                ->symbols()
        ],
    ];
}
```

### Token-Based Authentication

**Laravel Sanctum Configuration:**
```php
// config/sanctum.php
'expiration' => 60 * 24, // 24 hours

'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
    env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
))),
```

**Token Generation:**
```php
// app/Http/Controllers/Auth/AuthController.php
public function login(Request $request)
{
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required'
    ]);

    if (!Auth::attempt($credentials)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    $token = $request->user()->createToken('auth-token')->plainTextToken;

    return response()->json([
        'user' => $request->user(),
        'token' => $token
    ]);
}
```

### Role-Based Access Control

**Roles:**
- `admin` - Full system access
- `manager` - Management operations
- `driver` - Driver-specific operations
- `vehicle_owner` - Vehicle owner operations
- `gate_security` - Check-in/out operations

**Permission Check Example:**
```php
// app/Http/Controllers/VehicleController.php
public function destroy(Vehicle $vehicle)
{
    // Only admins can delete vehicles
    $this->authorize('delete', $vehicle);
    
    $vehicle->delete();
    
    return response()->json(['message' => 'Vehicle deleted']);
}
```

**Policy Example:**
```php
// app/Policies/VehiclePolicy.php
public function delete(User $user, Vehicle $vehicle)
{
    return $user->hasRole('admin');
}
```

---

## Data Protection

### SQL Injection Prevention

**✅ Always use Eloquent ORM or Query Builder:**
```php
// ✅ SAFE - Using Eloquent
$vehicles = Vehicle::where('status', $status)->get();

// ✅ SAFE - Using Query Builder with bindings
$vehicles = DB::table('vehicles')
    ->where('status', '=', $status)
    ->get();

// ❌ UNSAFE - Raw query without bindings
$vehicles = DB::select("SELECT * FROM vehicles WHERE status = '$status'");
```

### XSS Protection

**Laravel automatically escapes output in Blade templates:**
```php
// ✅ SAFE - Automatically escaped
{{ $vehicle->description }}

// ❌ UNSAFE - Unescaped (only use with trusted content)
{!! $vehicle->description !!}
```

**Frontend (React):**

React automatically escapes JSX expressions, but be careful with:
```jsx
// ✅ SAFE
<div>{user.name}</div>

// ❌ UNSAFE - dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### CSRF Protection

**Laravel automatically includes CSRF protection for web routes.**

For API routes using Sanctum, CSRF protection is handled via Sanctum's stateful configuration.

### Mass Assignment Protection

**Always define `$fillable` or `$guarded` in models:**
```php
// app/Models/Vehicle.php
protected $fillable = [
    'manufacturer',
    'model',
    'year',
    'plate_number',
    // ... other allowed fields
];

// Prevent mass assignment of sensitive fields
protected $guarded = [
    'id',
    'created_by',
    'updated_by',
];
```

---

## Input Validation

### Server-Side Validation

**All user input MUST be validated server-side:**
```php
// app/Http/Requests/StoreVehicleRequest.php
public function rules()
{
    return [
        'manufacturer' => 'required|string|max:255',
        'model' => 'required|string|max:255',
        'year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
        'plate_number' => 'required|string|max:50|unique:vehicles,plate_number',
        'vin' => 'nullable|string|size:17|unique:vehicles,vin',
        'color' => 'nullable|string|max:50',
        'status' => 'nullable|in:active,maintenance,inactive,sold',
        'fuel_type' => 'nullable|in:petrol,diesel,electric,hybrid,cng,lpg',
        'seating_capacity' => 'nullable|integer|min:1|max:100',
        'mileage' => 'nullable|numeric|min:0',
        'purchase_price' => 'nullable|numeric|min:0',
    ];
}
```

### Sanitization

**Sanitize user input before storing:**
```php
// app/Http/Controllers/VehicleController.php
public function store(StoreVehicleRequest $request)
{
    $data = $request->validated();
    
    // Additional sanitization
    $data['notes'] = strip_tags($data['notes'] ?? '');
    $data['plate_number'] = strtoupper($data['plate_number']);
    
    $vehicle = Vehicle::create($data);
    
    return response()->json($vehicle, 201);
}
```

---

## File Upload Security

### File Upload Validation

**Strict file validation rules:**
```php
// app/Http/Controllers/VehiclePhotoController.php
public function upload(Request $request, Vehicle $vehicle)
{
    $request->validate([
        'image' => [
            'required',
            'file',
            'image',                           // Must be image
            'mimes:jpeg,jpg,png,gif,webp',    // Allowed types
            'max:5120',                        // Max 5MB
            'dimensions:min_width=100,min_height=100,max_width=4000,max_height=4000'
        ]
    ]);
    
    // ... handle upload
}
```

### File Storage Security

**1. Store files outside public directory:**
```php
// Store in storage/app/private
$path = $request->file('document')->store('private/documents');
```

**2. Generate random filenames:**
```php
$filename = Str::random(40) . '.' . $file->getClientOriginalExtension();
$path = $file->storeAs('vehicles', $filename);
```

**3. Validate MIME type (not just extension):**
```php
$mimeType = $file->getMimeType();
if (!in_array($mimeType, ['image/jpeg', 'image/png', 'image/gif'])) {
    throw new ValidationException('Invalid file type');
}
```

**4. Scan for malware (if possible):**
```php
// Using ClamAV or similar
if (!$this->scanFile($file->getRealPath())) {
    throw new ValidationException('File contains malware');
}
```

### File Download Security

**Prevent directory traversal:**
```php
public function download($filename)
{
    // ❌ UNSAFE
    $path = storage_path('app/documents/' . $filename);
    
    // ✅ SAFE - Validate filename
    $filename = basename($filename); // Remove directory separators
    $path = storage_path('app/documents/' . $filename);
    
    if (!File::exists($path)) {
        abort(404);
    }
    
    return response()->download($path);
}
```

---

## API Security

### API Authentication

**All API routes require authentication:**
```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('vehicles', VehicleController::class);
    Route::apiResource('drivers', DriverController::class);
    // ... other routes
});
```

### API Rate Limiting

**Prevent API abuse:**
```php
// app/Http/Kernel.php
protected $middlewareGroups = [
    'api' => [
        \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
        // ... other middleware
    ],
];

// config/sanctum.php
'limiter' => 'api',

// routes/api.php
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    // 60 requests per minute
});
```

### CORS Configuration

**Properly configure CORS:**
```php
// config/cors.php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    
    'allowed_origins' => [
        'https://vms.basepan.com',
    ],
    
    'allowed_origins_patterns' => [],
    
    'allowed_headers' => ['*'],
    
    'exposed_headers' => [],
    
    'max_age' => 0,
    
    'supports_credentials' => true,
];
```

---

## Database Security

### Database Connection

**Use environment variables for credentials:**
```env
# .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vms_production
DB_USERNAME=vms_user
DB_PASSWORD=your_secure_password_here
```

**✅ NEVER hardcode credentials in code**

### Database User Permissions

**Grant minimum required permissions:**
```sql
-- Production database user should NOT have:
CREATE USER 'vms_user'@'localhost' IDENTIFIED BY 'secure_password';

-- Only grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON vms_production.* TO 'vms_user'@'localhost';

-- Don't grant:
-- DROP, CREATE, ALTER, INDEX, etc.
```

### Encrypted Fields

**Encrypt sensitive data:**
```php
// app/Models/User.php
protected $casts = [
    'social_security_number' => 'encrypted',
];
```

### Database Backups

**Regular encrypted backups:**
```bash
# Backup with encryption
mysqldump -u root -p vms_production | \
    openssl enc -aes-256-cbc -salt -pass pass:your_backup_password | \
    gzip > backup_$(date +%Y%m%d).sql.gz.enc
```

---

## Session Management

### Session Configuration
```php
// config/session.php
return [
    'driver' => env('SESSION_DRIVER', 'redis'),
    'lifetime' => 120, // 2 hours
    'expire_on_close' => false,
    'encrypt' => true,
    'secure' => env('SESSION_SECURE_COOKIE', true), // HTTPS only
    'http_only' => true, // Prevent JavaScript access
    'same_site' => 'lax',
    'domain' => env('SESSION_DOMAIN'),
];
```

### Token Expiration

**Set appropriate token expiration:**
```php
// config/sanctum.php
'expiration' => 60 * 24, // 24 hours

// Revoke tokens on logout
public function logout(Request $request)
{
    $request->user()->currentAccessToken()->delete();
    
    return response()->json(['message' => 'Logged out successfully']);
}
```

---

## HTTPS/SSL

### Force HTTPS

**Redirect all HTTP to HTTPS:**
```php
// app/Providers/AppServiceProvider.php
public function boot()
{
    if ($this->app->environment('production')) {
        URL::forceScheme('https');
    }
}
```

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name vms.basepan.com;
    return 301 https://$server_name$request_uri;
}
```

### SSL Configuration

**Use strong SSL/TLS settings:**
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

---

## Security Headers

### Configure Security Headers

**Add to Nginx configuration:**
```nginx
# Prevent clickjacking
add_header X-Frame-Options "SAMEORIGIN" always;

# Prevent MIME sniffing
add_header X-Content-Type-Options "nosniff" always;

# XSS Protection
add_header X-XSS-Protection "1; mode=block" always;

# Referrer Policy
add_header Referrer-Policy "no-referrer-when-downgrade" always;

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;

# Strict Transport Security (HSTS)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

**Or use Laravel middleware:**
```php
// app/Http/Middleware/SecurityHeaders.php
public function handle($request, Closure $next)
{
    $response = $next($request);
    
    $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
    $response->headers->set('X-Content-Type-Options', 'nosniff');
    $response->headers->set('X-XSS-Protection', '1; mode=block');
    $response->headers->set('Referrer-Policy', 'no-referrer-when-downgrade');
    
    return $response;
}
```

---

## Rate Limiting

### API Rate Limiting

**Protect against brute force and DDoS:**
```php
// config/sanctum.php
'limiter' => 'api',

// routes/api.php
Route::middleware(['throttle:60,1'])->group(function () {
    // 60 requests per minute per user
});

// Custom rate limiter
RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});

// Login rate limiting
RateLimiter::for('login', function (Request $request) {
    return Limit::perMinute(5)->by($request->email . $request->ip());
});
```

---

## Logging & Monitoring

### Security Logging

**Log security events:**
```php
// app/Http/Controllers/Auth/AuthController.php
public function login(Request $request)
{
    if (!Auth::attempt($credentials)) {
        Log::warning('Failed login attempt', [
            'email' => $request->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        
        return response()->json(['message' => 'Invalid credentials'], 401);
    }
    
    Log::info('User logged in', [
        'user_id' => $request->user()->id,
        'ip' => $request->ip(),
    ]);
    
    // ... continue
}
```

### Monitor Failed Login Attempts
```php
// app/Listeners/LogFailedLogin.php
public function handle(Failed $event)
{
    Log::warning('Failed login attempt', [
        'email' => $event->credentials['email'] ?? null,
        'ip' => request()->ip(),
    ]);
    
    // Optional: Lock account after 5 failed attempts
    // Implement account lockout logic
}
```

---

## Reporting Vulnerabilities

### How to Report

If you discover a security vulnerability, please email us at:

**Email:** security@basepan.com

**DO NOT** create a public GitHub issue for security vulnerabilities.

### What to Include

Please include:
1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)

### Response Timeline

- **Acknowledgment:** Within 48 hours
- **Initial Assessment:** Within 5 business days
- **Fix & Disclosure:** Coordinated with reporter

---

## Security Best Practices

### For Developers

1. ✅ **Always validate user input**
2. ✅ **Use parameterized queries**
3. ✅ **Implement proper authorization checks**
4. ✅ **Keep dependencies updated**
5. ✅ **Never commit secrets to Git**
6. ✅ **Use environment variables for configuration**
7. ✅ **Implement proper error handling**
8. ✅ **Log security events**
9. ✅ **Review code for security issues**
10. ✅ **Follow Laravel security best practices**

### For Administrators

1. ✅ **Keep server software updated**
2. ✅ **Use strong passwords**
3. ✅ **Enable firewall**
4. ✅ **Regular backups**
5. ✅ **Monitor logs**
6. ✅ **Disable unnecessary services**
7. ✅ **Implement fail2ban**
8. ✅ **Regular security audits**

### For Users

1. ✅ **Use strong, unique passwords**
2. ✅ **Enable two-factor authentication (if available)**
3. ✅ **Don't share login credentials**
4. ✅ **Log out after use**
5. ✅ **Report suspicious activity**

---

## Compliance

### GDPR Compliance

**Data Protection Measures:**
- User consent for data collection
- Right to access personal data
- Right to deletion (user_id anonymization)
- Data encryption
- Secure data storage
- Privacy policy

**Implementation:**
```php
// Delete user account and anonymize data
public function delete(User $user)
{
    // Anonymize instead of delete (preserve records)
    $user->update([
        'name' => 'Deleted User',
        'email' => 'deleted_' . Str::random(10) . '@deleted.local',
        'avatar' => null,
        'phone' => null,
    ]);
    
    // Or completely delete
    $user->delete();
}
```

---

## Security Checklist

### Pre-Deployment

- [ ] APP_DEBUG=false in production
- [ ] Strong database passwords
- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] File upload validation
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Input validation
- [ ] Output encoding
- [ ] Error handling
- [ ] Logging enabled

### Post-Deployment

- [ ] SSL certificate valid
- [ ] Firewall configured
- [ ] Security monitoring active
- [ ] Backups running
- [ ] Failed login monitoring
- [ ] Regular security updates
- [ ] Access logs reviewed
- [ ] Vulnerability scanning

---

## Resources

**Laravel Security:**
- https://laravel.com/docs/security

**OWASP Top 10:**
- https://owasp.org/www-project-top-ten/

**Security Tools:**
- OWASP ZAP (security scanner)
- Laravel Security Checker
- SonarQube (code quality)

---

## Contact

**Security Team:** security@basepan.com  
**General Support:** support@basepan.com  
**Phone:** +1 (709) 771-8379

---

*Last Updated: December 21, 2024*