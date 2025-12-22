# VMS Administrator Guide

## Overview

This guide is specifically for VMS administrators who manage the system, configure settings, and handle user management.

**Version:** 1.0  
**Last Updated:** December 21, 2024  
**Audience:** System Administrators

---

## Table of Contents

1. [Administrator Responsibilities](#administrator-responsibilities)
2. [User Management](#user-management)
3. [Role & Permission Management](#role--permission-management)
4. [System Configuration](#system-configuration)
5. [Data Management](#data-management)
6. [Security Management](#security-management)
7. [Backup & Recovery](#backup--recovery)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)
10. [API Management](#api-management)
11. [Email Configuration](#email-configuration)
12. [Queue Management](#queue-management)
13. [Performance Optimization](#performance-optimization)
14. [Audit Trail](#audit-trail)
15. [Best Practices](#best-practices)

---

## Administrator Responsibilities

### Core Responsibilities

**1. User Management**
- Create and manage user accounts
- Assign roles and permissions
- Handle password resets
- Monitor user activity
- Disable/enable accounts

**2. System Configuration**
- Configure application settings
- Manage email settings
- Set up notification preferences
- Configure file storage
- Update system parameters

**3. Data Management**
- Monitor data integrity
- Perform data cleanup
- Export/import data
- Archive old records
- Manage database

**4. Security**
- Monitor security logs
- Review access attempts
- Manage API tokens
- Configure security settings
- Handle security incidents

**5. Maintenance**
- Apply system updates
- Monitor performance
- Manage backups
- Clear caches
- Optimize database

---

## User Management

### Creating User Accounts

**Access:** Users → Add New User

**Steps:**

1. Click **"Add New User"** button
2. Fill in user information:

**Required Fields:**
- **Name:** Full name
- **Email:** Must be unique
- **Password:** Minimum 8 characters
- **Password Confirmation:** Must match

**Optional Fields:**
- Phone number
- Avatar/Profile picture
- Initial role assignment

3. Click **"Create User"**

**Post-Creation:**
- User receives welcome email with credentials
- User can login immediately
- Encourage user to change password on first login

### Editing User Accounts

**Steps:**

1. Go to **Users** page
2. Find the user
3. Click **✏️ Edit** button
4. Update information:
   - Personal details
   - Contact information
   - Role assignments
   - Account status
5. Click **"Save Changes"**

### Disabling User Accounts

**When to Disable:**
- Employee leaves organization
- Security breach suspected
- Account compromise
- Temporary suspension

**Steps:**

1. Edit user account
2. Toggle **"Account Status"** to "Disabled"
3. Click **"Save"**

**Effects:**
- User cannot login
- Active sessions terminated
- API tokens revoked
- Data remains intact

**Re-enabling:**
1. Edit user
2. Toggle status to "Active"
3. Save changes

### Deleting User Accounts

⚠️ **Warning:** Deleting users is permanent and should be done carefully.

**Before Deleting:**
- ✅ Export user's data if needed
- ✅ Reassign owned records
- ✅ Verify user is no longer needed
- ✅ Consider disabling instead

**Steps:**

1. Go to user details
2. Click **"Delete User"** button
3. Confirm action
4. Choose deletion method:
   - **Hard Delete:** Completely remove user
   - **Soft Delete:** Mark as deleted (recommended)
   - **Anonymize:** Keep records, remove personal data (GDPR)

### Password Reset

**Admin-Initiated Reset:**

1. Go to user account
2. Click **"Reset Password"**
3. Choose method:
   - **Send Reset Link:** Email link to user
   - **Set New Password:** Manually set password
4. Confirm action

**User receives:**
- Email with reset link (if email method)
- Temporary password (if manual method)

### Bulk User Management

**Bulk Import:**

1. Go to **Users → Import**
2. Download CSV template
3. Fill in user data
4. Upload CSV file
5. Review import preview
6. Confirm import

**CSV Template Columns:**
- name (required)
- email (required)
- phone
- role
- password (optional - auto-generated if empty)

**Bulk Operations:**
- Export all users
- Bulk role assignment
- Bulk password reset
- Bulk disable/enable

---

## Role & Permission Management

### Understanding Roles

**System Roles:**

**1. Admin**
- **Access:** Full system access
- **Capabilities:**
  - All CRUD operations
  - User management
  - System configuration
  - Delete permissions
  - Audit trail access

**2. Manager**
- **Access:** Management operations
- **Capabilities:**
  - Vehicle CRUD
  - Driver CRUD
  - Trip management
  - Expense management
  - Report generation
  - Cannot delete vehicles
  - Cannot manage users

**3. Driver**
- **Access:** Driver-specific operations
- **Capabilities:**
  - View assigned vehicle
  - Create/update trips
  - Create expenses
  - Update maintenance
  - View own profile

**4. Vehicle Owner**
- **Access:** Owner-specific operations
- **Capabilities:**
  - View owned vehicles
  - Schedule maintenance
  - View expenses
  - View trips
  - Create expenses

**5. Gate Security**
- **Access:** Check-in/out operations
- **Capabilities:**
  - Check in/out vehicles
  - View vehicle list
  - Create drivers
  - View users

### Assigning Roles

**Single User:**

1. Edit user account
2. Go to **"Roles"** section
3. Select role(s) from dropdown
4. Save changes

**Note:** Users can have multiple roles

**Bulk Assignment:**

1. Go to **Users** page
2. Select multiple users (checkboxes)
3. Click **"Bulk Actions"**
4. Select **"Assign Role"**
5. Choose role
6. Confirm

### Creating Custom Roles (Advanced)

**Via Tinker:**
```bash
php artisan tinker
```
```php
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

// Create role
$role = Role::create(['name' => 'fleet_coordinator']);

// Create permissions
$permission = Permission::create(['name' => 'view trips']);

// Assign permission to role
$role->givePermissionTo($permission);
```

### Permission Matrix

| Action | Admin | Manager | Driver | Vehicle Owner | Gate Security |
|--------|-------|---------|--------|---------------|---------------|
| View Vehicles | ✅ | ✅ | Own | Own | ✅ |
| Create Vehicle | ✅ | ✅ | ❌ | ❌ | ✅ |
| Edit Vehicle | ✅ | ✅ | ❌ | Own | ✅ |
| Delete Vehicle | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Drivers | ✅ | ✅ | ❌ | ❌ | ✅ |
| Create Driver | ✅ | ✅ | ❌ | ❌ | ✅ |
| Check In/Out | ✅ | ✅ | ❌ | ❌ | ✅ |
| Create Trip | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create Expense | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | Own | Own | ❌ |
| Manage Users | ✅ | ✅ | ❌ | ❌ | View |
| System Settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| Audit Trail | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## System Configuration

### Application Settings

**Access:** Via `.env` file or database configuration

**Key Settings:**
```env
# Application
APP_NAME="VMS"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://myvms.basepan.com

# Timezone
APP_TIMEZONE=Africa/Lagos

# Locale
APP_LOCALE=en
APP_FALLBACK_LOCALE=en
```

### Environment Configuration

**Development Environment:**
```env
APP_ENV=local
APP_DEBUG=true
LOG_LEVEL=debug
```

**Production Environment:**
```env
APP_ENV=production
APP_DEBUG=false
LOG_LEVEL=error
```

### File Storage Configuration

**Storage Disk:**
```php
// config/filesystems.php
'disks' => [
    'local' => [
        'driver' => 'local',
        'root' => storage_path('app'),
    ],
    
    'public' => [
        'driver' => 'local',
        'root' => storage_path('app/public'),
        'url' => env('APP_URL').'/storage',
        'visibility' => 'public',
    ],
    
    // For cloud storage (optional)
    's3' => [
        'driver' => 's3',
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION'),
        'bucket' => env('AWS_BUCKET'),
    ],
],
```

**Change Storage Driver:**
```env
FILESYSTEM_DISK=local  # or public, s3
```

### Upload Limits

**PHP Configuration:**
```bash
sudo nano /etc/php/8.1/fpm/php.ini
```
```ini
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
memory_limit = 256M
```

**Nginx Configuration:**
```nginx
client_max_body_size 10M;
```

**After changes:**
```bash
sudo systemctl restart php8.1-fpm
sudo systemctl restart nginx
```

---

## Data Management

### Database Maintenance

**Check Database Size:**
```bash
php artisan tinker
```
```php
DB::select("
    SELECT 
        table_name AS 'Table',
        ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
    FROM information_schema.TABLES
    WHERE table_schema = 'vms_production'
    ORDER BY (data_length + index_length) DESC
");
```

**Optimize Tables:**
```bash
php artisan db:optimize
```

Or manually:
```sql
OPTIMIZE TABLE vehicles;
OPTIMIZE TABLE trips;
OPTIMIZE TABLE maintenance;
OPTIMIZE TABLE expenses;
```

### Data Cleanup

**Clean Old Notifications:**
```bash
# Delete read notifications older than 90 days
php artisan notifications:cleanup
```

**Custom Cleanup Script:**
```php
// Delete old activity logs (older than 1 year)
DB::table('activity_log')
    ->where('created_at', '<', now()->subYear())
    ->delete();
```

### Data Export

**Export All Vehicles:**
```bash
php artisan export:vehicles --format=csv
```

**Export via Tinker:**
```php
use App\Models\Vehicle;

$vehicles = Vehicle::with(['owner', 'driver'])->get();

$csv = fopen('vehicles_export.csv', 'w');
fputcsv($csv, ['Plate Number', 'Manufacturer', 'Model', 'Year', 'Status']);

foreach ($vehicles as $vehicle) {
    fputcsv($csv, [
        $vehicle->plate_number,
        $vehicle->manufacturer,
        $vehicle->model,
        $vehicle->year,
        $vehicle->status,
    ]);
}

fclose($csv);
```

### Data Import

**Bulk Import Vehicles:**

1. Prepare CSV file with columns:
   - manufacturer
   - model
   - year
   - plate_number
   - ownership_type
   - status

2. Import via command:
```bash
php artisan import:vehicles vehicles.csv
```

3. Or create custom import script

---

## Security Management

### Monitoring Login Attempts

**View Failed Login Attempts:**
```bash
# Check Laravel logs
tail -f storage/logs/laravel.log | grep "Failed login"
```

**Database Query:**
```sql
SELECT * FROM activity_log 
WHERE description = 'login' 
AND properties->>'$.success' = 'false'
ORDER BY created_at DESC 
LIMIT 50;
```

### Managing API Tokens

**View Active Tokens:**
```php
use App\Models\User;

$user = User::find(1);
$tokens = $user->tokens;

foreach ($tokens as $token) {
    echo "Token: {$token->name}\n";
    echo "Last used: {$token->last_used_at}\n";
    echo "Created: {$token->created_at}\n\n";
}
```

**Revoke Token:**
```php
$user->tokens()->where('name', 'auth-token')->delete();
```

**Revoke All Tokens:**
```php
$user->tokens()->delete();
```

### Security Audit

**Regular Checks:**

1. **Review User Permissions**
```bash
   php artisan permission:cache-reset
   php artisan permission:show
```

2. **Check for Suspicious Activity**
   - Unusual login times
   - Multiple failed attempts
   - Access from unknown IPs

3. **Review File Permissions**
```bash
   ls -la storage/
   ls -la bootstrap/cache/
```

4. **Check SSL Certificate**
```bash
   sudo certbot certificates
```

### Implementing IP Whitelist

**Middleware:**
```php
// app/Http/Middleware/WhitelistIp.php
public function handle($request, Closure $next)
{
    $allowedIps = config('app.whitelist_ips', []);
    
    if (!in_array($request->ip(), $allowedIps)) {
        abort(403, 'Access denied from your IP address');
    }
    
    return $next($request);
}
```

**Configuration:**
```php
// config/app.php
'whitelist_ips' => [
    '192.168.1.1',
    '10.0.0.1',
],
```

---

## Backup & Recovery

### Automated Backups

**Database Backup Script:**
```bash
#!/bin/bash
# /usr/local/bin/vms-backup.sh

BACKUP_DIR="/backups/vms"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="vms_production"
DB_USER="vms_user"
DB_PASS="your_password"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Storage backup
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz /var/www/vms/storage/app/public

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
find $BACKUP_DIR -name "storage_*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

**Make Executable:**
```bash
sudo chmod +x /usr/local/bin/vms-backup.sh
```

**Schedule with Cron:**
```bash
sudo crontab -e

# Daily backup at 2 AM
0 2 * * * /usr/local/bin/vms-backup.sh >> /var/log/vms-backup.log 2>&1
```

### Manual Backup

**Database:**
```bash
mysqldump -u vms_user -p vms_production > backup_$(date +%Y%m%d).sql
```

**Files:**
```bash
tar -czf vms_files_$(date +%Y%m%d).tar.gz /var/www/vms/storage/app/public
```

### Restore from Backup

**Database Restore:**
```bash
# Stop workers
sudo supervisorctl stop vms-worker:*

# Restore database
gunzip < backup_20241221.sql.gz | mysql -u vms_user -p vms_production

# Restart workers
sudo supervisorctl start vms-worker:*
```

**Files Restore:**
```bash
# Extract files
tar -xzf vms_files_20241221.tar.gz -C /var/www/vms/storage/app/public/

# Fix permissions
sudo chown -R www-data:www-data /var/www/vms/storage
sudo chmod -R 775 /var/www/vms/storage
```

### Remote Backup

**Sync to Remote Server:**
```bash
# Using rsync
rsync -avz /backups/vms/ user@backup-server:/remote/backups/vms/

# Using AWS S3
aws s3 sync /backups/vms/ s3://your-bucket/vms-backups/
```

---

## Monitoring & Maintenance

### System Health Checks

**Check Application Status:**
```bash
# Test web server
curl -I https://myvms.basepan.com

# Test API
curl https://api.myvms.basepan.com/api/health
```

**Check Services:**
```bash
# Nginx
sudo systemctl status nginx

# PHP-FPM
sudo systemctl status php8.1-fpm

# MySQL
sudo systemctl status mysql

# Redis
sudo systemctl status redis

# Supervisor (queue workers)
sudo supervisorctl status
```

### Log Monitoring

**Application Logs:**
```bash
# Real-time Laravel logs
tail -f /var/www/vms/storage/logs/laravel.log

# View errors only
tail -f /var/www/vms/storage/logs/laravel.log | grep ERROR

# Queue worker logs
sudo supervisorctl tail vms-worker:vms-worker_00 stdout
```

**Web Server Logs:**
```bash
# Nginx access log
tail -f /var/log/nginx/vms-api-access.log

# Nginx error log
tail -f /var/log/nginx/vms-api-error.log
```

**System Logs:**
```bash
# System log
sudo tail -f /var/log/syslog

# Authentication log
sudo tail -f /var/log/auth.log
```

### Performance Monitoring

**Server Resources:**
```bash
# CPU and Memory
htop

# Disk usage
df -h

# Disk I/O
sudo iotop

# Network
sudo nethogs
```

**Database Performance:**
```sql
-- Show slow queries
SHOW PROCESSLIST;

-- Show table sizes
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS Size_MB
FROM information_schema.TABLES
WHERE table_schema = 'vms_production'
ORDER BY Size_MB DESC;

-- Show query cache
SHOW VARIABLES LIKE 'query_cache%';
```

**PHP Performance:**
```bash
# Check PHP-FPM status
curl http://localhost/status

# Monitor active processes
watch -n 1 'sudo grep "processes" /var/run/php/php8.1-fpm.sock'
```

### Scheduled Maintenance

**Clear Caches:**
```bash
# Application cache
php artisan cache:clear

# Configuration cache
php artisan config:clear

# Route cache
php artisan route:clear

# View cache
php artisan view:clear

# Optimize for production
php artisan optimize
```

**Database Maintenance:**
```bash
# Optimize tables
php artisan db:optimize

# Analyze tables
mysqlcheck -u vms_user -p --analyze vms_production

# Repair tables (if needed)
mysqlcheck -u vms_user -p --repair vms_production
```

---

## Troubleshooting

### Common Admin Issues

#### 1. Queue Workers Not Processing

**Check Status:**
```bash
sudo supervisorctl status
```

**Restart Workers:**
```bash
sudo supervisorctl restart vms-worker:*
```

**Check Queue Table:**
```sql
SELECT COUNT(*) FROM jobs;
SELECT * FROM jobs ORDER BY created_at DESC LIMIT 10;
```

**View Failed Jobs:**
```sql
SELECT * FROM failed_jobs ORDER BY failed_at DESC LIMIT 10;
```

**Retry Failed Jobs:**
```bash
php artisan queue:retry all
```

#### 2. Storage Full

**Check Disk Space:**
```bash
df -h
```

**Find Large Files:**
```bash
sudo du -h /var/www/vms/storage | sort -rh | head -20
```

**Clean Up:**
```bash
# Clear old logs
sudo find /var/www/vms/storage/logs -name "*.log" -mtime +30 -delete

# Clear old cached files
php artisan cache:clear
php artisan view:clear
```

#### 3. Email Not Sending

**Test Email Configuration:**
```bash
php artisan tinker
```
```php
Mail::raw('Test email', function ($message) {
    $message->to('test@example.com')
            ->subject('Test Email');
});
```

**Check Mail Logs:**
```bash
tail -f /var/log/mail.log
```

**Verify Queue is Running:**
```bash
sudo supervisorctl status vms-worker:*
```

#### 4. High CPU Usage

**Identify Process:**
```bash
top
htop
```

**Check PHP-FPM Processes:**
```bash
sudo systemctl status php8.1-fpm
```

**Optimize PHP-FPM:**
```bash
sudo nano /etc/php/8.1/fpm/pool.d/www.conf

# Adjust these values
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35

# Restart
sudo systemctl restart php8.1-fpm
```

#### 5. Database Connection Errors

**Test Connection:**
```bash
mysql -u vms_user -p vms_production
```

**Check MySQL Status:**
```bash
sudo systemctl status mysql
```

**Check Connection Limit:**
```sql
SHOW VARIABLES LIKE 'max_connections';
SHOW STATUS LIKE 'Threads_connected';
```

**Increase Connections:**
```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Add/modify
max_connections = 200

# Restart
sudo systemctl restart mysql
```

---

## API Management

### API Rate Limiting

**View Current Limits:**
```php
// config/sanctum.php
'limiter' => 'api',

// routes/api.php
Route::middleware(['throttle:60,1'])->group(function () {
    // 60 requests per minute
});
```

**Adjust Rate Limits:**
```php
// app/Providers/RouteServiceProvider.php
RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
});
```

### API Monitoring

**Track API Usage:**
```sql
SELECT 
    DATE(created_at) as date,
    COUNT(*) as requests
FROM activity_log
WHERE log_name = 'api'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### API Documentation

**Generate API Docs:**
```bash
# Using Scribe
composer require --dev knuckleswtf/scribe

php artisan scribe:generate
```

**Access:** `https://api.myvms.basepan.com/docs`

---

## Email Configuration

### SMTP Setup

**Configuration (.env):**
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@basepan.com
MAIL_FROM_NAME="${APP_NAME}"
```

### Test Email Sending
```bash
php artisan tinker
```
```php
use App\Models\User;
use Illuminate\Support\Facades\Mail;

$user = User::first();

Mail::raw('This is a test email', function ($message) use ($user) {
    $message->to($user->email)
            ->subject('VMS Test Email');
});

// Check for errors
```

### Email Queue

**Queue Configuration:**
```env
QUEUE_CONNECTION=database
```

**Monitor Email Queue:**
```sql
SELECT * FROM jobs WHERE queue = 'emails';
```

---

## Queue Management

### Queue Configuration

**Queue Driver (.env):**
```env
QUEUE_CONNECTION=database  # or redis, sqs
```

### Monitor Queue

**Check Queue Size:**
```bash
php artisan queue:monitor database
```

**View Jobs:**
```sql
-- Pending jobs
SELECT * FROM jobs;

-- Failed jobs
SELECT * FROM failed_jobs;
```

### Manage Failed Jobs

**Retry All Failed:**
```bash
php artisan queue:retry all
```

**Retry Specific Job:**
```bash
php artisan queue:retry <job-id>
```

**Delete Failed Jobs:**
```bash
php artisan queue:flush
```

### Queue Workers

**Restart Workers:**
```bash
sudo supervisorctl restart vms-worker:*
```

**Add More Workers:**

Edit `/etc/supervisor/conf.d/vms-worker.conf`:
```ini
numprocs=4  # Increase from 2 to 4
```
```bash
sudo supervisorctl reread
sudo supervisorctl update
```

---

## Performance Optimization

### Caching Strategy

**Enable Caching:**
```bash
# Cache config
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer dump-autoload --optimize
```

### Database Optimization

**Add Indexes:**
```sql
-- For frequently queried columns
CREATE INDEX idx_vehicle_status ON vehicles(status);
CREATE INDEX idx_trip_vehicle_date ON trips(vehicle_id, start_time);
CREATE INDEX idx_expense_date ON expenses(date);
```

**Query Optimization:**
```php
// Use eager loading
$vehicles = Vehicle::with(['owner', 'driver', 'maintenance'])->get();

// Instead of N+1 queries
$vehicles = Vehicle::all();
foreach ($vehicles as $vehicle) {
    echo $vehicle->owner->name; // N+1 problem
}
```

### PHP OPcache

**Enable OPcache:**
```ini
# /etc/php/8.1/fpm/php.ini
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0  # Production only
opcache.revalidate_freq=0
```

**Clear OPcache:**
```bash
sudo systemctl reload php8.1-fpm
```

---

## Audit Trail

### Viewing Audit Logs

**Access:** Audit Trail page in admin panel

**Query Logs:**
```php
use Spatie\Activitylog\Models\Activity;

// All activities
$activities = Activity::all();

// User activities
$userActivities = Activity::causedBy($user)->get();

// Model activities
$vehicleActivities = Activity::forSubject(Vehicle::find(1))->get();

// Recent activities
$recent = Activity::latest()->take(50)->get();
```

### Filtering Audit Logs
```php
// Activities in date range
$activities = Activity::whereBetween('created_at', [$start, $end])->get();

// By log name
$activities = Activity::where('log_name', 'vehicle')->get();

// By description
$activities = Activity::where('description', 'created')->get();
```

### Exporting Audit Logs
```bash
php artisan export:audit-logs --from=2024-01-01 --to=2024-12-31
```

---

## Best Practices

### Security Best Practices

1. ✅ **Regular Updates**
   - Update Laravel monthly
   - Update dependencies weekly
   - Apply security patches immediately

2. ✅ **Strong Passwords**
   - Enforce password complexity
   - Require password changes every 90 days
   - No password reuse

3. ✅ **Access Control**
   - Principle of least privilege
   - Regular permission audits
   - Remove unnecessary accounts

4. ✅ **Monitoring**
   - Review logs daily
   - Monitor failed logins
   - Track suspicious activity

5. ✅ **Backups**
   - Daily automated backups
   - Test restores monthly
   - Store backups off-site

### Performance Best Practices

1. ✅ **Caching**
   - Enable OPcache
   - Cache configuration
   - Use Redis for sessions

2. ✅ **Database**
   - Regular optimization
   - Proper indexing
   - Query optimization

3. ✅ **Queue**
   - Offload heavy tasks
   - Monitor queue size
   - Auto-scaling workers

4. ✅ **CDN**
   - Serve static assets from CDN
   - Enable compression
   - Browser caching

### Maintenance Best Practices

1. ✅ **Regular Schedule**
   - Weekly: Cache clearing
   - Monthly: Database optimization
   - Quarterly: Security audit

2. ✅ **Documentation**
   - Document all changes
   - Maintain runbooks
   - Update procedures

3. ✅ **Testing**
   - Test before production
   - Have rollback plan
   - Monitor after deployment

---

## Emergency Procedures

### Site Down

1. **Check Services**
```bash
   sudo systemctl status nginx
   sudo systemctl status php8.1-fpm
   sudo systemctl status mysql
```

2. **Check Logs**
```bash
   tail -100 /var/log/nginx/error.log
   tail -100 /var/www/vms/storage/logs/laravel.log
```

3. **Restart Services**
```bash
   sudo systemctl restart nginx
   sudo systemctl restart php8.1-fpm
```

### Database Crash

1. **Check Status**
```bash
   sudo systemctl status mysql
```

2. **Attempt Restart**
```bash
   sudo systemctl restart mysql
```

3. **Repair Tables**
```bash
   mysqlcheck -u vms_user -p --auto-repair vms_production
```

4. **Restore from Backup** (if needed)

### Security Breach

1. **Immediate Actions**
   - Change all admin passwords
   - Revoke all API tokens
   - Review access logs
   - Disable compromised accounts

2. **Investigation**
   - Check audit trail
   - Review server logs
   - Identify entry point

3. **Remediation**
   - Patch vulnerability
   - Update dependencies
   - Strengthen security

4. **Communication**
   - Notify affected users
   - Document incident
   - Update security procedures

---

## Contact & Support

**Technical Support:** support@basepan.com  
**Security Issues:** security@basepan.com  
**Phone:** +1 (709) 771-8379

---

*Last Updated: December 21, 2024*  
*Version: 1.0*