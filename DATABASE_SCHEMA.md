# Database Schema Documentation

## Overview

**Database:** MySQL 8.0+ / PostgreSQL 13+  
**Charset:** utf8mb4  
**Collation:** utf8mb4_unicode_ci  
**Version:** 1.0  
**Last Updated:** December 21, 2024

---

## Entity Relationship Diagram
```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    users     │◄───1:1──│   drivers    │◄───1:1──│  vehicles    │
│              │         │              │         │              │
│ PK: id       │         │ PK: id       │         │ PK: id       │
│    name      │         │ FK: user_id  │         │    plate_no  │
│    email     │         │ FK: vehicle  │         │    model     │
│    password  │         │    license   │         │    year      │
│    avatar    │         │    phone     │         │ FK: owner_id │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │ 1                      │ *                      │ 1
       │                        │                        │
       │ *                      │ *                      │ *
       │                        │                        │
┌──────▼─────────┐    ┌────────▼────────┐    ┌─────────▼─────────┐
│ model_has_roles│    │   check_in_out  │    │   maintenance     │
│                │    │                 │    │                   │
│ FK: model_id   │    │ PK: id          │    │ PK: id            │
│ FK: role_id    │    │ FK: vehicle_id  │    │ FK: vehicle_id    │
└────────────────┘    │ FK: driver_id   │    │    description    │
                      │    checked_in   │    │    cost           │
                      │    checked_out  │    │    date           │
                      │    purpose      │    │ FK: expense_id    │
                      └─────────────────┘    └───────────────────┘
                                                      │ 1
                                                      │
                      ┌─────────────────┐            │ 1
                      │     trips       │    ┌───────▼───────┐
                      │                 │    │   expenses    │
                      │ PK: id          │    │               │
                      │ FK: vehicle_id  │───►│ PK: id        │
                      │ FK: driver_id   │ *  │ FK: vehicle_id│
                      │    start_loc    │    │    amount     │
                      │    end_loc      │    │    category   │
                      │    start_time   │    │    date       │
                      │    end_time     │    └───────────────┘
                      │    distance     │
                      │    amount       │
                      │    status       │
                      └─────────────────┘
                               │ *
                               │
                               │ 1
                      ┌────────▼────────┐
                      │    incomes      │
                      │                 │
                      │ PK: id          │
                      │ FK: trip_id     │
                      │    amount       │
                      │    date         │
                      │    source       │
                      └─────────────────┘
```

---

## Tables

### users

**Description:** System users (admins, managers, drivers, vehicle owners, gate security)

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | PRIMARY KEY | User ID |
| name | VARCHAR(255) | NO | - | - | Full name |
| email | VARCHAR(255) | NO | - | UNIQUE | Email address |
| email_verified_at | TIMESTAMP | YES | NULL | - | Email verification time |
| password | VARCHAR(255) | NO | - | - | Hashed password |
| avatar | VARCHAR(255) | YES | NULL | - | Avatar file path |
| phone | VARCHAR(20) | YES | NULL | - | Phone number |
| notification_preferences | JSON | YES | NULL | - | User notification settings |
| login_count | INT | NO | 0 | - | Total login count |
| last_login_at | TIMESTAMP | YES | NULL | - | Last login timestamp |
| remember_token | VARCHAR(100) | YES | NULL | - | Remember me token |
| created_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | - | Record created |
| updated_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | - | Record updated |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE KEY (`email`)
- INDEX (`created_at`)

**Sample Data:**
```sql
INSERT INTO users (name, email, password) VALUES
('Admin User', 'admin@basepan.com', '$2y$10$...'),
('Manager User', 'manager@basepan.com', '$2y$10$...'),
('Driver User', 'driver@basepan.com', '$2y$10$...');
```

---

### roles

**Description:** System roles (from Spatie Permission)

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | PRIMARY KEY | Role ID |
| name | VARCHAR(255) | NO | - | UNIQUE | Role name |
| guard_name | VARCHAR(255) | NO | 'api' | - | Guard name |
| created_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | - | Record created |
| updated_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | - | Record updated |

**Default Roles:**
- `admin` - Full system access
- `manager` - Management operations
- `driver` - Driver operations
- `vehicle_owner` - Vehicle owner operations
- `gate_security` - Gate security operations

---

### model_has_roles

**Description:** User-Role pivot table (from Spatie Permission)

| Column | Type | Nullable | Constraints | Description |
|--------|------|----------|-------------|-------------|
| role_id | BIGINT UNSIGNED | NO | FK → roles(id) | Role ID |
| model_type | VARCHAR(255) | NO | - | Model class |
| model_id | BIGINT UNSIGNED | NO | FK → users(id) | User ID |

**Indexes:**
- PRIMARY KEY (`role_id`, `model_id`, `model_type`)
- INDEX (`model_id`, `model_type`)

---

### vehicles

**Description:** Vehicle records

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | PRIMARY KEY | Vehicle ID |
| manufacturer | VARCHAR(255) | NO | - | - | Vehicle make |
| model | VARCHAR(255) | NO | - | - | Vehicle model |
| year | INT | NO | - | - | Manufacturing year |
| plate_number | VARCHAR(50) | NO | - | UNIQUE | License plate |
| ownership_type | ENUM | NO | - | 'organization','individual' | Ownership type |
| individual_type | ENUM | YES | NULL | 'staff','visitor','vehicle_owner' | Individual type |
| owner_id | BIGINT UNSIGNED | YES | NULL | FK → users(id) | Owner user ID |
| color | VARCHAR(50) | YES | NULL | - | Vehicle color |
| vin | VARCHAR(17) | YES | NULL | UNIQUE | Vehicle ID number |
| status | ENUM | YES | 'active' | 'active','maintenance','inactive','sold' | Current status |
| fuel_type | ENUM | YES | NULL | 'petrol','diesel','electric','hybrid','cng','lpg' | Fuel type |
| seating_capacity | INT | YES | NULL | - | Number of seats |
| mileage | DECIMAL(10,2) | YES | NULL | - | Current mileage (km) |
| purchase_date | DATE | YES | NULL | - | Purchase date |
| purchase_price | DECIMAL(12,2) | YES | NULL | - | Purchase price |
| photos | JSON | YES | NULL | - | Array of photo paths |
| primary_photo | VARCHAR(255) | YES | NULL | - | Main photo path |
| notes | TEXT | YES | NULL | - | Additional notes |
| created_by | BIGINT UNSIGNED | YES | NULL | FK → users(id) | Creator user ID |
| updated_by | BIGINT UNSIGNED | YES | NULL | FK → users(id) | Editor user ID |
| created_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | - | Record created |
| updated_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | - | Record updated |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE KEY (`plate_number`)
- UNIQUE KEY (`vin`)
- INDEX (`owner_id`)
- INDEX (`status`)
- INDEX (`ownership_type`)
- INDEX (`created_at`)

**Foreign Keys:**
```sql
ALTER TABLE vehicles
ADD CONSTRAINT vehicles_owner_id_foreign 
FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE vehicles
ADD CONSTRAINT vehicles_created_by_foreign 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE vehicles
ADD CONSTRAINT vehicles_updated_by_foreign 
FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
```

---

### drivers

**Description:** Driver records

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | PRIMARY KEY | Driver ID |
| user_id | BIGINT UNSIGNED | NO | - | UNIQUE, FK → users(id) | User ID |
| vehicle_id | BIGINT UNSIGNED | YES | NULL | UNIQUE, FK → vehicles(id) | Assigned vehicle |
| license_number | VARCHAR(50) | NO | - | UNIQUE | Driver's license number |
| license_expiry_date | DATE | YES | NULL | - | License expiry |
| driver_type | ENUM | YES | NULL | 'full_time','part_time','contract' | Employment type |
| sex | ENUM | YES | NULL | 'male','female' | Gender |
| phone_number | VARCHAR(20) | YES | NULL | - | Phone number |
| home_address | TEXT | YES | NULL | - | Home address |
| created_by | BIGINT UNSIGNED | YES | NULL | FK → users(id) | Creator |
| updated_by | BIGINT UNSIGNED | YES | NULL | FK → users(id) | Editor |
| created_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | - | Record created |
| updated_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | - | Record updated |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE KEY (`user_id`)
- UNIQUE KEY (`license_number`)
- UNIQUE KEY (`vehicle_id`)

**Foreign Keys:**
```sql
ALTER TABLE drivers
ADD CONSTRAINT drivers_user_id_foreign 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE drivers
ADD CONSTRAINT drivers_vehicle_id_foreign 
FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL;
```

---

### check_in_outs

**Description:** Vehicle check-in/out records

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | PRIMARY KEY | Check-in ID |
| vehicle_id | BIGINT UNSIGNED | NO | - | FK → vehicles(id) | Vehicle ID |
| driver_id | BIGINT UNSIGNED | YES | NULL | FK → drivers(id) | Driver ID |
| checked_in_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | - | Check-in time |
| checked_out_at | TIMESTAMP | YES | NULL | - | Check-out time |
| purpose | VARCHAR(255) | YES | NULL | - | Visit purpose |
| created_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | - | Record created |
| updated_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | - | Record updated |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`vehicle_id`)
- INDEX (`driver_id`)
- INDEX (`checked_in_at`)
- INDEX (`checked_out_at`)

**Foreign Keys:**
```sql
ALTER TABLE check_in_outs
ADD CONSTRAINT check_in_outs_vehicle_id_foreign 
FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;

ALTER TABLE check_in_outs
ADD CONSTRAINT check_in_outs_driver_id_foreign 
FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL;
```

---

### maintenance

**Description:** Vehicle maintenance records

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | PRIMARY KEY | Maintenance ID |
| vehicle_id | BIGINT UNSIGNED | NO | - | FK → vehicles(id) | Vehicle ID |
| description | TEXT | NO | - | - | Maintenance description |
| status | ENUM | NO | 'Pending' | 'Pending','in_progress','Completed' | Status |
| cost | DECIMAL(10,2) | YES | 0.00 | - | Cost amount |
| date | DATE | NO | - | - | Scheduled/completed date |
| notes | TEXT | YES | NULL | - | Additional notes |
| attachments | JSON | YES | NULL | - | Attachment file paths |
| created_by | BIGINT UNSIGNED | YES | NULL | FK → users(id) | Creator |
| updated_by | BIGINT UNSIGNED | YES | NULL | FK → users(id) | Editor |
| created_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | - | Record created |
| updated_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | - | Record updated |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`vehicle_id`)
- INDEX (`status`)
- INDEX (`date`)

**Foreign Keys:**
```sql
ALTER TABLE maintenance
ADD CONSTRAINT maintenance_vehicle_id_foreign 
FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;
```

---

### expenses

**Description:** Vehicle expense records

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | PRIMARY KEY | Expense ID |
| vehicle_id | BIGINT UNSIGNED | NO | - | FK → vehicles(id) | Vehicle ID |
| maintenance_id | BIGINT UNSIGNED | YES | NULL | FK → maintenance(id) | Related maintenance |
| category | ENUM | YES | NULL | 'fuel','maintenance','insurance','repairs','other' | Expense category |
| amount | DECIMAL(10,2) | NO | - | - | Expense amount |
| description | TEXT | YES | NULL | - | Description |
| date | DATE | NO | - | - | Expense date |
| created_by | BIGINT UNSIGNED | YES | NULL | FK → users(id) | Creator |
| updated_by | BIGINT UNSIGNED | YES | NULL | FK → users(id) | Editor |
| created_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | - | Record created |
| updated_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | - | Record updated |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`vehicle_id`)
- INDEX (`maintenance_id`)
- INDEX (`category`)
- INDEX (`date`)

**Foreign Keys:**
```sql
ALTER TABLE expenses
ADD CONSTRAINT expenses_vehicle_id_foreign 
FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;

ALTER TABLE expenses
ADD CONSTRAINT expenses_maintenance_id_foreign 
FOREIGN KEY (maintenance_id) REFERENCES maintenance(id) ON DELETE SET NULL;
```

---

### trips

**Description:** Vehicle trip records

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | PRIMARY KEY | Trip ID |
| vehicle_id | BIGINT UNSIGNED | NO | - | FK → vehicles(id) | Vehicle ID |
| driver_id | BIGINT UNSIGNED | NO | - | FK → drivers(id) | Driver ID |
| start_location | VARCHAR(255) | NO | - | - | Start location |
| end_location | VARCHAR(255) | NO | - | - | End location |
| start_time | TIMESTAMP | NO | - | - | Start time |
| end_time | TIMESTAMP | YES | NULL | - | End time |
| distance | DECIMAL(8,2) | YES | NULL | - | Distance (km) |
| amount | DECIMAL(10,2) | YES | 0.00 | - | Trip amount |
| status | ENUM | NO | 'pending' | 'pending','in_progress','completed' | Trip status |
| purpose | VARCHAR(255) | YES | NULL | - | Trip purpose |
| created_by | BIGINT UNSIGNED | YES | NULL | FK → users(id) | Creator |
| updated_by | BIGINT UNSIGNED | YES | NULL | FK → users(id) | Editor |
| created_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | - | Record created |
| updated_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | - | Record updated |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`vehicle_id`)
- INDEX (`driver_id`)
- INDEX (`status`)
- INDEX (`start_time`)

**Foreign Keys:**
```sql
ALTER TABLE trips
ADD CONSTRAINT trips_vehicle_id_foreign 
FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;

ALTER TABLE trips
ADD CONSTRAINT trips_driver_id_foreign 
FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE;
```

---

### incomes

**Description:** Income records (from trips or other sources)

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | PRIMARY KEY | Income ID |
| trip_id | BIGINT UNSIGNED | YES | NULL | FK → trips(id) | Related trip |
| amount | DECIMAL(10,2) | NO | - | - | Income amount |
| source | VARCHAR(255) | YES | NULL | - | Income source |
| date | DATE | NO | - | - | Income date |
| description | TEXT | YES | NULL | - | Description |
| created_by | BIGINT UNSIGNED | YES | NULL | FK → users(id) | Creator |
| updated_by | BIGINT UNSIGNED | YES | NULL | FK → users(id) | Editor |
| created_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | - | Record created |
| updated_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | - | Record updated |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`trip_id`)
- INDEX (`date`)

**Foreign Keys:**
```sql
ALTER TABLE incomes
ADD CONSTRAINT incomes_trip_id_foreign 
FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL;
```

---

### notifications

**Description:** User notifications (Laravel notifications table)

| Column | Type | Nullable | Constraints | Description |
|--------|------|----------|-------------|-------------|
| id | CHAR(36) | NO | PRIMARY KEY | Notification UUID |
| type | VARCHAR(255) | NO | - | Notification class |
| notifiable_type | VARCHAR(255) | NO | - | Notifiable model |
| notifiable_id | BIGINT UNSIGNED | NO | - | User ID |
| data | TEXT | NO | - | Notification data (JSON) |
| read_at | TIMESTAMP | YES | NULL | Read timestamp |
| created_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | Created timestamp |
| updated_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | Updated timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`notifiable_type`, `notifiable_id`)

---

### activity_log

**Description:** System activity logs (from Spatie Activity Log)

| Column | Type | Nullable | Constraints | Description |
|--------|------|----------|-------------|-------------|
| id | BIGINT UNSIGNED | NO | PRIMARY KEY, AUTO_INCREMENT | Log ID |
| log_name | VARCHAR(255) | YES | NULL | Log name |
| description | TEXT | NO | - | Activity description |
| subject_type | VARCHAR(255) | YES | NULL | Subject model |
| subject_id | BIGINT UNSIGNED | YES | NULL | Subject ID |
| causer_type | VARCHAR(255) | YES | NULL | Causer model |
| causer_id | BIGINT UNSIGNED | YES | NULL | Causer ID (User) |
| properties | JSON | YES | NULL | Activity properties |
| created_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | Created timestamp |
| updated_at | TIMESTAMP | YES | CURRENT_TIMESTAMP | Updated timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- INDEX (`subject_type`, `subject_id`)
- INDEX (`causer_type`, `causer_id`)
- INDEX (`log_name`)

---

## Relationships

### One-to-One
```sql
-- User → Driver
users.id = drivers.user_id

-- Driver → Vehicle
drivers.vehicle_id = vehicles.id
```

### One-to-Many
```sql
-- User → Vehicles (as owner)
users.id = vehicles.owner_id

-- Vehicle → Maintenance
vehicles.id = maintenance.vehicle_id

-- Vehicle → Expenses
vehicles.id = expenses.vehicle_id

-- Vehicle → Trips
vehicles.id = trips.vehicle_id

-- Driver → Trips
drivers.id = trips.driver_id

-- Vehicle → CheckInOuts
vehicles.id = check_in_outs.vehicle_id

-- Maintenance → Expense
maintenance.id = expenses.maintenance_id

-- Trip → Income
trips.id = incomes.trip_id
```

### Many-to-Many
```sql
-- Users ↔ Roles (via model_has_roles)
users.id = model_has_roles.model_id
roles.id = model_has_roles.role_id
```

---

## Migration Order

Run migrations in this order:

1. `create_users_table`
2. `create_password_reset_tokens_table`
3. `create_failed_jobs_table`
4. `create_personal_access_tokens_table` (Sanctum)
5. `create_permission_tables` (Spatie)
6. `create_vehicles_table`
7. `create_drivers_table`
8. `create_check_in_outs_table`
9. `create_maintenance_table`
10. `create_expenses_table`
11. `create_trips_table`
12. `create_incomes_table`
13. `create_notifications_table`
14. `create_activity_log_table` (Spatie)
15. `add_notification_preferences_to_users_table`

**Command:**
```bash
php artisan migrate
```

---

## Seeders

### DatabaseSeeder.php
```php
public function run()
{
    $this->call([
        RoleSeeder::class,
        UserSeeder::class,
        VehicleSeeder::class,
        DriverSeeder::class,
    ]);
}
```

### Default Data

**Roles:**
- admin
- manager
- driver
- vehicle_owner
- gate_security

**Users:**
- admin@basepan.com (password: password) - Admin
- manager@basepan.com (password: password) - Manager
- driver@basepan.com (password: password) - Driver

**Run Seeders:**
```bash
php artisan db:seed
```

---

## Backup & Restore

### Backup
```bash
# Full database backup
mysqldump -u username -p vms_database > backup_$(date +%Y%m%d_%H%M%S).sql

# Specific tables
mysqldump -u username -p vms_database users vehicles > backup_users_vehicles.sql
```

### Restore
```bash
# Restore full database
mysql -u username -p vms_database < backup_20241221_120000.sql

# Restore specific tables
mysql -u username -p vms_database < backup_users_vehicles.sql
```

---

## Performance Optimization

### Indexes

All critical foreign keys and search columns are indexed.

### Query Optimization
```sql
-- Add composite indexes for common queries
CREATE INDEX idx_vehicle_status_ownership ON vehicles(status, ownership_type);
CREATE INDEX idx_trip_vehicle_status ON trips(vehicle_id, status);
CREATE INDEX idx_expense_vehicle_date ON expenses(vehicle_id, date);
```

### Database Tuning
```sql
-- Optimize tables
OPTIMIZE TABLE users;
OPTIMIZE TABLE vehicles;
OPTIMIZE TABLE trips;

-- Analyze tables
ANALYZE TABLE users;
ANALYZE TABLE vehicles;
```

---

## Security

### Sensitive Data

- Passwords are hashed using bcrypt
- Tokens stored securely in `personal_access_tokens`
- User data protected by role-based access

### Audit Trail

All critical operations logged in `activity_log` table.

---

## Changelog

### Version 1.0 (2024-12-21)
- Initial database schema
- All core tables created
- Relationships established
- Indexes optimized
- Seeders configured

---

*Last Updated: December 21, 2024*