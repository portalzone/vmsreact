# VMS Deployment Guide

## Overview

This guide covers deploying the Vehicle Management System (VMS) to production environments.

**Last Updated:** December 21, 2024  
**Version:** 1.0

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Backend Deployment](#backend-deployment-laravel)
4. [Frontend Deployment](#frontend-deployment-react)
5. [Web Server Configuration](#web-server-configuration)
6. [SSL Certificate](#ssl-certificate)
7. [Database Setup](#database-setup)
8. [Queue Workers](#queue-workers)
9. [Scheduled Tasks](#scheduled-tasks)
10. [File Storage](#file-storage)
11. [Environment Variables](#environment-variables)
12. [Monitoring & Logging](#monitoring--logging)
13. [Backup Strategy](#backup-strategy)
14. [Rollback Plan](#rollback-plan)
15. [Health Checks](#health-checks)
16. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Minimum Server Requirements

**Hardware:**
- CPU: 2 cores (4 cores recommended)
- RAM: 2GB minimum (4GB recommended)
- Storage: 20GB SSD (50GB+ recommended)
- Network: 100Mbps connection

**Software:**
- Operating System: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- PHP 8.1 or higher
- MySQL 8.0+ or PostgreSQL 13+
- Node.js 18+
- Nginx or Apache 2.4+
- Composer 2.5+
- Git 2.30+
- Redis 6+ (optional, for caching)
- Supervisor (for queue workers)

### Domain Requirements

- Domain name configured (e.g., myvms.basepan.com)
- DNS records pointing to server IP
- SSL certificate (Let's Encrypt recommended)

---

## Server Setup

### 1. Update System
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 2. Install Required Software

#### PHP 8.1+
```bash
# Ubuntu 20.04/22.04
sudo apt install software-properties-common
sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install -y php8.1 php8.1-fpm php8.1-mysql php8.1-xml \
  php8.1-mbstring php8.1-curl php8.1-gd php8.1-zip php8.1-bcmath \
  php8.1-intl php8.1-redis

# Verify installation
php -v
```

#### MySQL 8.0+
```bash
# Ubuntu
sudo apt install -y mysql-server

# Secure installation
sudo mysql_secure_installation

# Verify installation
mysql --version
```

#### Node.js 18+
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v
```

#### Composer
```bash
# Download and install
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer

# Verify installation
composer --version
```

#### Nginx
```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify installation
nginx -v
```

#### Redis (Optional - for caching)
```bash
# Install Redis
sudo apt install -y redis-server

# Start and enable
sudo systemctl start redis
sudo systemctl enable redis

# Verify installation
redis-cli ping
# Should return: PONG
```

#### Supervisor (for queue workers)
```bash
# Install Supervisor
sudo apt install -y supervisor

# Start and enable
sudo systemctl start supervisor
sudo systemctl enable supervisor
```

### 3. Configure Firewall
```bash
# Ubuntu (UFW)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## Backend Deployment (Laravel)

### 1. Create Application Directory
```bash
# Create directory
sudo mkdir -p /var/www/vms
sudo chown -R $USER:$USER /var/www/vms
```

### 2. Clone Repository
```bash
# Using Git
cd /var/www/vms
git clone https://github.com/yourusername/vms-backend.git .

# Or upload files via FTP/SFTP
```

### 3. Install Dependencies
```bash
cd /var/www/vms

# Install Composer dependencies (production)
composer install --optimize-autoloader --no-dev

# If you get memory errors
COMPOSER_MEMORY_LIMIT=-1 composer install --optimize-autoloader --no-dev
```

### 4. Configure Environment
```bash
# Copy environment file
cp .env.example .env

# Edit environment file
nano .env
```

**Production .env Configuration:**
```env
# Application
APP_NAME="VMS"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://myvms.basepan.com

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vms_production
DB_USERNAME=vms_user
DB_PASSWORD=your_secure_password_here

# Queue
QUEUE_CONNECTION=database

# Cache & Session
CACHE_DRIVER=redis
SESSION_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@basepan.com"
MAIL_FROM_NAME="${APP_NAME}"

# File Storage
FILESYSTEM_DISK=local

# Broadcasting (Laravel Reverb)
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=your_app_id
REVERB_APP_KEY=your_app_key
REVERB_APP_SECRET=your_app_secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=error

# Security
SANCTUM_STATEFUL_DOMAINS=myvms.basepan.com
SESSION_DOMAIN=.basepan.com
```

### 5. Generate Application Key
```bash
php artisan key:generate
```

### 6. Set Permissions
```bash
# Set ownership
sudo chown -R www-data:www-data /var/www/vms

# Set directory permissions
sudo find /var/www/vms -type d -exec chmod 755 {} \;

# Set file permissions
sudo find /var/www/vms -type f -exec chmod 644 {} \;

# Storage and cache writable
sudo chmod -R 775 /var/www/vms/storage
sudo chmod -R 775 /var/www/vms/bootstrap/cache
```

### 7. Run Migrations
```bash
# Run migrations
php artisan migrate --force

# Seed database (optional - only for first deployment)
php artisan db:seed --force
```

### 8. Optimize Laravel
```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer dump-autoload --optimize
```

### 9. Create Storage Link
```bash
php artisan storage:link
```

---

## Frontend Deployment (React)

### 1. Create Frontend Directory
```bash
sudo mkdir -p /var/www/vms-frontend
sudo chown -R $USER:$USER /var/www/vms-frontend
```

### 2. Clone Repository
```bash
cd /var/www/vms-frontend
git clone https://github.com/yourusername/vms-frontend.git .
```

### 3. Configure Environment
```bash
# Create .env file
nano .env
```

**Production .env:**
```env
VITE_API_URL=https://myvms.basepan.com
VITE_APP_NAME=VMS

# Reverb (WebSocket)
VITE_REVERB_APP_KEY=your_app_key
VITE_REVERB_HOST=reverb.myvms.basepan.com
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

### 4. Install Dependencies
```bash
npm install --production
```

### 5. Build for Production
```bash
# Build React app
npm run build

# This creates 'dist' folder with optimized assets
```

### 6. Deploy Build Files
```bash
# Option 1: Nginx serves from dist folder
sudo mkdir -p /var/www/vms-frontend/dist

# Option 2: Copy to web root
sudo cp -r dist/* /var/www/vms-frontend/public/
```

---

## Web Server Configuration

### Nginx Configuration

#### 1. Backend (Laravel API)

**File:** `/etc/nginx/sites-available/vms-api`
```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name api.myvms.basepan.com;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.myvms.basepan.com;
    
    root /var/www/vms/public;
    index index.php;
    
    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/api.myvms.basepan.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.myvms.basepan.com/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
    
    # Logging
    access_log /var/log/nginx/vms-api-access.log;
    error_log /var/log/nginx/vms-api-error.log;
    
    # Laravel
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    # PHP-FPM
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        
        # Increase timeout for large uploads
        fastcgi_read_timeout 300;
    }
    
    # Deny access to hidden files
    location ~ /\.(?!well-known).* {
        deny all;
    }
    
    # Block access to sensitive files
    location ~ /\.git {
        deny all;
    }
    
    location ~ /\.env {
        deny all;
    }
    
    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Max upload size
    client_max_body_size 10M;
}
```

#### 2. Frontend (React)

**File:** `/etc/nginx/sites-available/vms-frontend`
```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name myvms.basepan.com www.myvms.basepan.com;
    
    return 301 https://myvms.basepan.com$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name myvms.basepan.com www.myvms.basepan.com;
    
    root /var/www/vms-frontend/dist;
    index index.html;
    
    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/myvms.basepan.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/myvms.basepan.com/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript;
    
    # Logging
    access_log /var/log/nginx/vms-frontend-access.log;
    error_log /var/log/nginx/vms-frontend-error.log;
    
    # React Router - SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Don't cache HTML
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

### Enable Sites
```bash
# Create symbolic links
sudo ln -s /etc/nginx/sites-available/vms-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/vms-frontend /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## SSL Certificate

### Using Let's Encrypt (Recommended - Free)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificates for both domains
sudo certbot --nginx -d api.myvms.basepan.com
sudo certbot --nginx -d myvms.basepan.com -d www.myvms.basepan.com

# Certbot will automatically:
# - Obtain certificates
# - Update Nginx configuration
# - Set up auto-renewal

# Test auto-renewal
sudo certbot renew --dry-run

# Certificates auto-renew via cron
```

### Manual SSL Configuration

If using custom certificates:
```bash
# Copy certificates to server
sudo mkdir -p /etc/ssl/vms
sudo cp fullchain.pem /etc/ssl/vms/
sudo cp privkey.pem /etc/ssl/vms/

# Update Nginx configuration
ssl_certificate /etc/ssl/vms/fullchain.pem;
ssl_certificate_key /etc/ssl/vms/privkey.pem;
```

---

## Database Setup

### 1. Create Database
```bash
# Login to MySQL
sudo mysql -u root -p

# Create database
CREATE DATABASE vms_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user
CREATE USER 'vms_user'@'localhost' IDENTIFIED BY 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON vms_production.* TO 'vms_user'@'localhost';

# Flush privileges
FLUSH PRIVILEGES;

# Exit
EXIT;
```

### 2. Import Database (if migrating)
```bash
# Import from backup
mysql -u vms_user -p vms_production < backup.sql
```

### 3. Run Migrations
```bash
cd /var/www/vms
php artisan migrate --force
```

---

## Queue Workers

### Configure Supervisor

**File:** `/etc/supervisor/conf.d/vms-worker.conf`
```ini
[program:vms-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/vms/artisan queue:work database --sleep=3 --tries=3 --max-time=3600 --timeout=60
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/vms/storage/logs/worker.log
stopwaitsecs=3600
```

### Laravel Reverb Worker (WebSocket)

**File:** `/etc/supervisor/conf.d/vms-reverb.conf`
```ini
[program:vms-reverb]
command=php /var/www/vms/artisan reverb:start
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/www/vms/storage/logs/reverb.log
```

### Start Workers
```bash
# Reload Supervisor configuration
sudo supervisorctl reread
sudo supervisorctl update

# Start workers
sudo supervisorctl start vms-worker:*
sudo supervisorctl start vms-reverb

# Check status
sudo supervisorctl status

# View logs
sudo supervisorctl tail vms-worker:vms-worker_00 stdout
```

---

## Scheduled Tasks

### Configure Cron
```bash
# Edit crontab for www-data user
sudo crontab -e -u www-data
```

**Add this line:**
```cron
* * * * * cd /var/www/vms && php artisan schedule:run >> /dev/null 2>&1
```

**Scheduled commands in Laravel:**
```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    // Send maintenance reminders daily at 9 AM
    $schedule->command('app:send-maintenance-reminders')->dailyAt('09:00');
    
    // Send weekly summary every Monday at 8 AM
    $schedule->command('app:send-weekly-summary')->weeklyOn(1, '08:00');
    
    // Cleanup old notifications weekly
    $schedule->command('notifications:cleanup')->weekly();
}
```

---

## File Storage

### Configure Storage
```bash
# Create storage directories
sudo mkdir -p /var/www/vms/storage/app/public/{avatars,vehicles,maintenance-attachments}

# Set permissions
sudo chown -R www-data:www-data /var/www/vms/storage
sudo chmod -R 775 /var/www/vms/storage

# Create symbolic link
php artisan storage:link
```

### Backup Storage
```bash
# Create backup script
sudo nano /usr/local/bin/vms-storage-backup.sh
```

**Backup Script:**
```bash
#!/bin/bash

BACKUP_DIR="/backups/vms-storage"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup storage folder
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz /var/www/vms/storage/app/public

# Keep only last 7 days
find $BACKUP_DIR -name "storage_*.tar.gz" -mtime +7 -delete

echo "Storage backup completed: storage_$DATE.tar.gz"
```
```bash
# Make executable
sudo chmod +x /usr/local/bin/vms-storage-backup.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
0 2 * * * /usr/local/bin/vms-storage-backup.sh
```

---

## Environment Variables

### Sensitive Data Security

**Never commit .env to Git**
```bash
# Add to .gitignore
echo ".env" >> .gitignore
```

### Environment Variable Best Practices

1. ✅ Use strong, unique passwords
2. ✅ Generate new APP_KEY for production
3. ✅ Set APP_DEBUG=false
4. ✅ Use environment-specific database credentials
5. ✅ Secure mail credentials
6. ✅ Set proper SESSION_DOMAIN
7. ✅ Configure SANCTUM_STATEFUL_DOMAINS

---

## Monitoring & Logging

### Application Logs
```bash
# Laravel logs
tail -f /var/www/vms/storage/logs/laravel.log

# Worker logs
tail -f /var/www/vms/storage/logs/worker.log

# Reverb logs
tail -f /var/www/vms/storage/logs/reverb.log
```

### Nginx Logs
```bash
# Access logs
tail -f /var/log/nginx/vms-api-access.log
tail -f /var/log/nginx/vms-frontend-access.log

# Error logs
tail -f /var/log/nginx/vms-api-error.log
tail -f /var/log/nginx/vms-frontend-error.log
```

### System Monitoring
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Monitor resources
htop           # CPU and memory
iotop          # Disk I/O
nethogs        # Network usage
```

### Log Rotation

**File:** `/etc/logrotate.d/vms`
```
/var/www/vms/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        sudo supervisorctl restart vms-worker:*
    endscript
}
```

---

## Backup Strategy

### Database Backup

**Create backup script:**
```bash
sudo nano /usr/local/bin/vms-db-backup.sh
```

**Script content:**
```bash
#!/bin/bash

BACKUP_DIR="/backups/vms-database"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="vms_production"
DB_USER="vms_user"
DB_PASS="your_password"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

echo "Database backup completed: db_$DATE.sql.gz"
```
```bash
# Make executable
sudo chmod +x /usr/local/bin/vms-db-backup.sh

# Add to crontab (daily at 1 AM)
sudo crontab -e
0 1 * * * /usr/local/bin/vms-db-backup.sh
```

### Full Application Backup
```bash
#!/bin/bash

BACKUP_DIR="/backups/vms-full"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz \
  --exclude='/var/www/vms/node_modules' \
  --exclude='/var/www/vms/vendor' \
  /var/www/vms

# Keep only last 7 days
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +7 -delete
```

### Remote Backup
```bash
# Sync to remote server (rsync)
rsync -avz /backups/ user@backup-server:/remote/backups/vms/

# Or use cloud storage (AWS S3, Google Cloud Storage, etc.)
aws s3 sync /backups/ s3://your-bucket/vms-backups/
```

---

## Rollback Plan

### 1. Keep Previous Version
```bash
# Before deploying new version
cp -r /var/www/vms /var/www/vms-backup-$(date +%Y%m%d)
```

### 2. Database Rollback
```bash
# Restore from backup
gunzip < /backups/vms-database/db_20241221.sql.gz | mysql -u vms_user -p vms_production
```

### 3. Code Rollback
```bash
# Stop workers
sudo supervisorctl stop vms-worker:*
sudo supervisorctl stop vms-reverb

# Restore previous version
rm -rf /var/www/vms
mv /var/www/vms-backup-20241221 /var/www/vms

# Restore permissions
sudo chown -R www-data:www-data /var/www/vms

# Clear cache
cd /var/www/vms
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Restart workers
sudo supervisorctl start vms-worker:*
sudo supervisorctl start vms-reverb

# Reload Nginx
sudo systemctl reload nginx
```

### 4. Using Git
```bash
# Rollback to specific commit
cd /var/www/vms
git log --oneline  # Find commit hash
git checkout <commit-hash>

# Install dependencies
composer install --no-dev
php artisan migrate

# Optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Health Checks

### Backend Health Check
```bash
# Test API endpoint
curl -I https://api.myvms.basepan.com/api/health

# Expected: HTTP/2 200
```

**Create health check endpoint:**
```php
// routes/api.php
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now(),
        'services' => [
            'database' => DB::connection()->getPdo() ? 'connected' : 'disconnected',
            'cache' => Cache::has('health_check') || Cache::put('health_check', true, 60),
            'queue' => Queue::size() !== null,
        ]
    ]);
});
```

### Frontend Health Check
```bash
curl -I https://myvms.basepan.com

# Expected: HTTP/2 200
```

### Automated Monitoring

**Using Uptime Robot (free):**
1. Sign up at uptimerobot.com
2. Add monitors for:
   - https://myvms.basepan.com
   - https://api.myvms.basepan.com/api/health
3. Set alert email

---

## Troubleshooting

### Issue: 500 Internal Server Error

**Check:**
```bash
# Laravel logs
tail -50 /var/www/vms/storage/logs/laravel.log

# Nginx error log
tail -50 /var/log/nginx/vms-api-error.log

# PHP-FPM logs
tail -50 /var/log/php8.1-fpm.log
```

**Common fixes:**
```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Fix permissions
sudo chown -R www-data:www-data /var/www/vms/storage
sudo chmod -R 775 /var/www/vms/storage
```

### Issue: Database Connection Failed

**Check:**
```bash
# Test MySQL connection
mysql -u vms_user -p vms_production

# Check .env credentials
cat /var/www/vms/.env | grep DB_

# Test from Laravel
php artisan tinker
>>> DB::connection()->getPdo();
```

### Issue: Queue Not Processing

**Check:**
```bash
# Supervisor status
sudo supervisorctl status

# Restart workers
sudo supervisorctl restart vms-worker:*

# Check queue table
mysql -u vms_user -p
USE vms_production;
SELECT * FROM jobs LIMIT 10;
```

### Issue: File Upload Not Working

**Check:**
```bash
# Storage permissions
ls -la /var/www/vms/storage/app/public

# Storage link exists
ls -la /var/www/vms/public/storage

# PHP upload limits
php -i | grep upload_max_filesize
php -i | grep post_max_size

# Nginx upload limit
grep client_max_body_size /etc/nginx/sites-available/vms-api
```

**Fix:**
```bash
# Increase PHP limits
sudo nano /etc/php/8.1/fpm/php.ini

upload_max_filesize = 10M
post_max_size = 10M

# Restart PHP-FPM
sudo systemctl restart php8.1-fpm
```

### Issue: SSL Certificate Error

**Check:**
```bash
# Test SSL
openssl s_client -connect myvms.basepan.com:443

# Check certificate expiry
sudo certbot certificates

# Renew if needed
sudo certbot renew
```

---

## Post-Deployment Checklist

- [ ] All environment variables configured correctly
- [ ] Database migrations run successfully
- [ ] SSL certificates installed and working
- [ ] Queue workers running
- [ ] Cron jobs scheduled
- [ ] File permissions correct
- [ ] Storage linked
- [ ] Logs rotating properly
- [ ] Backups configured
- [ ] Health checks passing
- [ ] Monitoring set up
- [ ] Test all critical features
- [ ] Performance optimizations applied
- [ ] Security headers configured
- [ ] Firewall rules active

---

## Security Hardening

### Additional Security Measures
```bash
# 1. Disable directory listing
# Add to Nginx config
autoindex off;

# 2. Hide Nginx version
# In /etc/nginx/nginx.conf
server_tokens off;

# 3. Limit request rate
# In Nginx server block
limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;
limit_req zone=one burst=20;

# 4. Enable ModSecurity (optional)
sudo apt install -y libmodsecurity3

# 5. Install Fail2Ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## Performance Optimization

### PHP-FPM Tuning
```bash
sudo nano /etc/php/8.1/fpm/pool.d/www.conf
```
```ini
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 500
```

### MySQL Optimization
```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```
```ini
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 200
query_cache_size = 64M
```

### Enable OPcache
```bash
sudo nano /etc/php/8.1/fpm/php.ini
```
```ini
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0
```

---

## Continuous Deployment

### Using Git Hooks

**File:** `/var/www/vms/.git/hooks/post-receive`
```bash
#!/bin/bash

cd /var/www/vms || exit

# Pull latest changes
git pull origin main

# Install dependencies
composer install --no-dev --optimize-autoloader

# Run migrations
php artisan migrate --force

# Clear and cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart workers
sudo supervisorctl restart vms-worker:*

echo "Deployment completed successfully!"
```

---

## Support & Resources

**Documentation:** https://laravel.com/docs  
**Community:** https://laracasts.com/discuss  
**Issues:** GitHub Issues  

**Contact:**
- Email: support@basepan.com
- Phone: +1 (709) 771-8379

---

*Last Updated: December 21, 2024*