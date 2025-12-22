# VMS Troubleshooting Guide

Common issues and their solutions for the Vehicle Management System.

**Version:** 1.0  
**Last Updated:** December 21, 2024

---

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Login & Authentication Issues](#login--authentication-issues)
3. [Database Issues](#database-issues)
4. [API Issues](#api-issues)
5. [Frontend Issues](#frontend-issues)
6. [File Upload Issues](#file-upload-issues)
7. [Email Issues](#email-issues)
8. [Performance Issues](#performance-issues)
9. [Queue & Worker Issues](#queue--worker-issues)
10. [SSL & Security Issues](#ssl--security-issues)
11. [Deployment Issues](#deployment-issues)
12. [Common Error Messages](#common-error-messages)

---

## Installation Issues

### Issue: Composer Install Fails

**Symptoms:**
```
Fatal error: Allowed memory size exhausted
```

**Solution:**
```bash
# Increase memory limit temporarily
COMPOSER_MEMORY_LIMIT=-1 composer install

# Or permanently in php.ini
memory_limit = 512M
```

---

### Issue: NPM Install Fails

**Symptoms:**
```
npm ERR! code EACCES
npm ERR! syscall access
```

**Solution:**
```bash
# Fix permissions
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config

# Or use npx
npx create-vite@latest

# Clear cache
npm cache clean --force
npm install
```

---

### Issue: Migration Fails

**Symptoms:**
```
SQLSTATE[42S01]: Base table or view already exists
```

**Solution:**
```bash
# Fresh migration
php artisan migrate:fresh

# With seeding
php artisan migrate:fresh --seed

# Rollback and re-run
php artisan migrate:rollback
php artisan migrate
```

---

## Login & Authentication Issues

### Issue: Cannot Login - Invalid Credentials

**Symptoms:**
- Correct email and password but login fails
- "Invalid credentials" error

**Solutions:**

**1. Check Database:**
```bash
php artisan tinker
```
```php
$user = User::where('email', 'admin@basepan.com')->first();
dd($user); // Check if user exists
```

**2. Reset Password:**
```bash
php artisan tinker
```
```php
$user = User::where('email', 'admin@basepan.com')->first();
$user->password = Hash::make('newpassword');
$user->save();
```

**3. Clear Sessions:**
```bash
php artisan cache:clear
php artisan config:clear
```

---

### Issue: Token Not Being Sent/Received

**Symptoms:**
- 401 Unauthorized on API calls
- "Unauthenticated" message

**Solutions:**

**1. Check Token Storage:**
```javascript
// In browser console
console.log(localStorage.getItem('token'));
```

**2. Verify Axios Interceptor:**
```javascript
// src/services/api.js
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Request headers:', config.headers); // Debug
  return config;
});
```

**3. Check Sanctum Configuration:**
```php
// config/sanctum.php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
    env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
))),
```

---

### Issue: Session Expired Immediately

**Symptoms:**
- Logged out after page refresh
- Session expires too quickly

**Solutions:**

**1. Check Session Configuration:**
```php
// config/session.php
'lifetime' => 120, // Increase to 480 (8 hours)
'expire_on_close' => false,
```

**2. Check Token Expiration:**
```php
// config/sanctum.php
'expiration' => 60 * 24, // 24 hours
```

**3. Clear Cache:**
```bash
php artisan config:clear
php artisan cache:clear
```

---

## Database Issues

### Issue: Connection Refused

**Symptoms:**
```
SQLSTATE[HY000] [2002] Connection refused
```

**Solutions:**

**1. Check MySQL is Running:**
```bash
sudo systemctl status mysql
sudo systemctl start mysql
```

**2. Verify Database Credentials:**
```bash
mysql -u vms_user -p
# Try to connect manually
```

**3. Check .env Configuration:**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1  # Try localhost
DB_PORT=3306
DB_DATABASE=vms_production
DB_USERNAME=vms_user
DB_PASSWORD=your_password
```

**4. Restart Services:**
```bash
php artisan config:clear
sudo systemctl restart mysql
```

---

### Issue: Table Not Found

**Symptoms:**
```
SQLSTATE[42S02]: Base table or view not found
```

**Solutions:**
```bash
# Run migrations
php artisan migrate

# If migrations already ran
php artisan migrate:status

# Force re-run
php artisan migrate:fresh --seed
```

---

### Issue: Foreign Key Constraint Fails

**Symptoms:**
```
SQLSTATE[23000]: Integrity constraint violation
```

**Solutions:**

**1. Check Relationships:**
- Ensure parent record exists before creating child
- Verify foreign key values are valid

**2. Disable Foreign Key Checks (Temporary):**
```sql
SET FOREIGN_KEY_CHECKS=0;
-- Your queries here
SET FOREIGN_KEY_CHECKS=1;
```

**3. Fix Migration Order:**
- Parent tables must be created before child tables

---

## API Issues

### Issue: CORS Error

**Symptoms:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**

**1. Configure CORS:**
```php
// config/cors.php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:5173'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

**2. Use Vite Proxy (Alternative):**
```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
}
```

**3. Clear Config:**
```bash
php artisan config:clear
```

---

### Issue: 419 CSRF Token Mismatch

**Symptoms:**
```
419 | Page Expired
CSRF token mismatch
```

**Solutions:**

**1. For API Routes:**
- Don't use CSRF for API (Sanctum handles it)
- Ensure routes are in `routes/api.php`

**2. Check Middleware:**
```php
// app/Http/Kernel.php
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

**3. Clear Sessions:**
```bash
php artisan session:clear
php artisan config:clear
```

---

### Issue: 404 Not Found on API Routes

**Symptoms:**
- API routes return 404
- Works locally but not on production

**Solutions:**

**1. Check Route File:**
```bash
php artisan route:list
# Verify API routes are listed
```

**2. Clear Route Cache:**
```bash
php artisan route:clear
php artisan route:cache
```

**3. Check .htaccess (Apache):**
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

**4. Check Nginx Configuration:**
```nginx
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
```

---

## Frontend Issues

### Issue: Blank White Screen

**Symptoms:**
- App loads blank page
- No errors visible

**Solutions:**

**1. Check Browser Console:**
- Open DevTools (F12)
- Look for JavaScript errors

**2. Common Causes:**

**Missing Environment Variables:**
```bash
# Ensure .env file exists
cp .env.example .env
```

**Build Issues:**
```bash
# Clear and rebuild
rm -rf node_modules
npm install
npm run build
```

**Router Issues:**
```jsx
// Ensure BrowserRouter wraps app
<BrowserRouter>
  <App />
</BrowserRouter>
```

---

### Issue: Components Not Rendering

**Symptoms:**
- Components appear broken
- Missing styles or content

**Solutions:**

**1. Check Imports:**
```jsx
// Correct
import Component from './Component';

// Wrong
import Component from './component'; // Case-sensitive!
```

**2. Check CSS Import:**
```jsx
// In main.jsx or App.jsx
import './index.css';
```

**3. Rebuild:**
```bash
npm run dev
```

---

### Issue: React Router Not Working

**Symptoms:**
- Routes work in dev but 404 in production
- Direct URLs return 404

**Solutions:**

**1. Configure Server for SPA:**

**Nginx:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## File Upload Issues

### Issue: File Upload Fails

**Symptoms:**
```
413 Payload Too Large
or
File too large
```

**Solutions:**

**1. Increase PHP Upload Limit:**
```bash
sudo nano /etc/php/8.1/fpm/php.ini
```
```ini
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
```

**2. Increase Nginx Limit:**
```nginx
client_max_body_size 10M;
```

**3. Restart Services:**
```bash
sudo systemctl restart php8.1-fpm
sudo systemctl restart nginx
```

---

### Issue: Uploaded Files Not Appearing

**Symptoms:**
- Upload succeeds but file not visible
- Broken image links

**Solutions:**

**1. Check Storage Link:**
```bash
php artisan storage:link
```

**2. Verify Permissions:**
```bash
sudo chmod -R 775 storage/app/public
sudo chown -R www-data:www-data storage
```

**3. Check File Path:**
```php
// Correct
Storage::disk('public')->put('vehicles', $file);

// Get URL
Storage::url($path);
```

---

## Email Issues

### Issue: Emails Not Sending

**Symptoms:**
- No emails received
- No error messages

**Solutions:**

**1. Test Email Configuration:**
```bash
php artisan tinker
```
```php
Mail::raw('Test', function($msg) {
    $msg->to('test@example.com')->subject('Test');
});
```

**2. Check Queue:**
```bash
# If using queues
php artisan queue:work

# Check failed jobs
php artisan queue:failed
```

**3. Check Mail Configuration:**
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@basepan.com
```

**4. Check Logs:**
```bash
tail -f storage/logs/laravel.log
```

---

### Issue: Emails Go to Spam

**Symptoms:**
- Emails sent but in spam folder

**Solutions:**

**1. Configure SPF Record:**
```
v=spf1 include:_spf.google.com ~all
```

**2. Configure DKIM**

**3. Use Reputable SMTP Provider:**
- SendGrid
- Mailgun
- Amazon SES

---

## Performance Issues

### Issue: Slow Page Load Times

**Symptoms:**
- Pages take > 3 seconds to load
- Slow API responses

**Solutions:**

**1. Enable Caching:**
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**2. Optimize Database:**
```bash
php artisan db:optimize
```

**3. Use Eager Loading:**
```php
// Bad (N+1 problem)
$vehicles = Vehicle::all();
foreach ($vehicles as $vehicle) {
    echo $vehicle->owner->name;
}

// Good
$vehicles = Vehicle::with('owner')->get();
```

**4. Enable OPcache:**
```ini
# php.ini
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
```

---

### Issue: High Memory Usage

**Symptoms:**
- Out of memory errors
- Server crashes

**Solutions:**

**1. Optimize Queries:**
```php
// Use chunk for large datasets
Vehicle::chunk(100, function ($vehicles) {
    foreach ($vehicles as $vehicle) {
        // Process
    }
});
```

**2. Increase PHP Memory:**
```ini
memory_limit = 512M
```

**3. Use Pagination:**
```php
$vehicles = Vehicle::paginate(15);
```

---

## Queue & Worker Issues

### Issue: Queue Not Processing

**Symptoms:**
- Jobs stuck in queue
- Workers not running

**Solutions:**

**1. Check Worker Status:**
```bash
sudo supervisorctl status
```

**2. Restart Workers:**
```bash
sudo supervisorctl restart vms-worker:*
```

**3. Check Queue Table:**
```sql
SELECT * FROM jobs;
```

**4. Process Queue Manually:**
```bash
php artisan queue:work --once
```

---

### Issue: Failed Jobs

**Symptoms:**
- Jobs failing repeatedly
- Error in failed_jobs table

**Solutions:**

**1. View Failed Jobs:**
```bash
php artisan queue:failed
```

**2. Retry Failed Job:**
```bash
# Retry specific job
php artisan queue:retry <job-id>

# Retry all
php artisan queue:retry all
```

**3. Delete Failed Jobs:**
```bash
php artisan queue:flush
```

---

## SSL & Security Issues

### Issue: SSL Certificate Error

**Symptoms:**
```
NET::ERR_CERT_AUTHORITY_INVALID
Your connection is not private
```

**Solutions:**

**1. Check Certificate:**
```bash
sudo certbot certificates
```

**2. Renew Certificate:**
```bash
sudo certbot renew
```

**3. Test Auto-Renewal:**
```bash
sudo certbot renew --dry-run
```

---

### Issue: Mixed Content Warning

**Symptoms:**
- HTTPS page loading HTTP resources
- Browser blocks content

**Solutions:**

**1. Update APP_URL:**
```env
APP_URL=https://vms.basepan.com
```

**2. Force HTTPS:**
```php
// AppServiceProvider
if ($this->app->environment('production')) {
    URL::forceScheme('https');
}
```

---

## Deployment Issues

### Issue: 500 Internal Server Error

**Symptoms:**
- Site shows 500 error
- No specific error message

**Solutions:**

**1. Check Error Logs:**
```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Nginx logs
tail -f /var/log/nginx/error.log

# PHP-FPM logs
tail -f /var/log/php8.1-fpm.log
```

**2. Enable Debug Mode Temporarily:**
```env
APP_DEBUG=true
```
⚠️ **Remember to disable after debugging!**

**3. Check Permissions:**
```bash
sudo chown -R www-data:www-data storage
sudo chmod -R 775 storage bootstrap/cache
```

**4. Clear All Caches:**
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

---

### Issue: Assets Not Loading After Deployment

**Symptoms:**
- CSS/JS files returning 404
- Broken images

**Solutions:**

**1. Build Assets:**
```bash
npm run build
```

**2. Check Public Path:**
```nginx
root /var/www/vms/public;
```

**3. Verify Asset Paths:**
```html
<!-- Should be absolute paths in production -->
<script src="/assets/app.js"></script>
```

---

## Common Error Messages

### "Class 'App\Http\Controllers\Vehicle' not found"

**Solution:**
```php
// Add use statement
use App\Models\Vehicle;
```

---

### "Undefined variable: vehicle"

**Solution:**
```php
// Ensure variable is defined
$vehicle = Vehicle::find($id);
if (!$vehicle) {
    abort(404);
}
```

---

### "Too many connections"

**Solution:**
```bash
# Increase MySQL connections
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Add/modify
max_connections = 200

# Restart
sudo systemctl restart mysql
```

---

### "Cannot modify header information"

**Solution:**
- Remove any output before headers
- Check for BOM in PHP files
- Ensure no whitespace before `<?php`

---

## Still Having Issues?

### Before Contacting Support

1. **Check error logs:**
   - Laravel: `storage/logs/laravel.log`
   - Nginx: `/var/log/nginx/error.log`
   - PHP: `/var/log/php8.1-fpm.log`

2. **Verify environment:**
   - PHP version: `php -v`
   - Laravel version: `php artisan --version`
   - Node version: `node -v`

3. **Clear everything:**
```bash
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   php artisan view:clear
   composer dump-autoload
```

### Contact Support

**Email:** support@basepan.com  
**Phone:** +1 (709) 771-8379  
**GitHub Issues:** https://github.com/yourorg/vms/issues

**Include:**
- Error message
- Steps to reproduce
- Environment details
- Relevant logs
- Screenshots

---

*Last Updated: December 21, 2024*  
*Version: 1.0*