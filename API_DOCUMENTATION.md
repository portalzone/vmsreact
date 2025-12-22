# VMS API Documentation

## Overview

**Base URL:** `http://localhost:8000/api` (Development)  
**Base URL:** `https://myvms.basepan.com` (Production)

**Version:** 1.0  
**Last Updated:** December 21, 2024

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Vehicles](#vehicles)
4. [Drivers](#drivers)
5. [Check-Ins](#check-ins)
6. [Maintenance](#maintenance)
7. [Expenses](#expenses)
8. [Trips](#trips)
9. [Income](#income)
10. [Dashboard](#dashboard)
11. [Reports](#reports)
12. [Notifications](#notifications)
13. [Error Codes](#error-codes)
14. [Rate Limiting](#rate-limiting)

---

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {token}
```

### POST /login

**Description:** Authenticate user and receive access token

**Auth Required:** No

**Request Body:**
```json
{
  "email": "contact@basepan.com",
  "password": "password"
}
```

**Success Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@basepan.com",
    "avatar": null,
    "phone": null,
    "roles": [
      {
        "id": 1,
        "name": "admin"
      }
    ]
  },
  "token": "1|abc123xyz..."
}
```

**Error Responses:**

`401 Unauthorized`
```json
{
  "message": "Invalid credentials"
}
```

`422 Unprocessable Entity`
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password field is required."]
  }
}
```

---

### POST /register

**Description:** Register new user

**Auth Required:** No

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Success Response:** `201 Created`
```json
{
  "user": {
    "id": 2,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "2|def456uvw..."
}
```

---

### POST /logout

**Description:** Logout and invalidate token

**Auth Required:** Yes

**Success Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

### GET /me

**Description:** Get current authenticated user

**Auth Required:** Yes

**Success Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@basepan.com",
  "avatar": "avatars/user1.jpg",
  "avatar_url": "http://localhost:8000/storage/avatars/user1.jpg",
  "phone": "+1234567890",
  "roles": [
    {
      "id": 1,
      "name": "admin"
    }
  ]
}
```

---

## Vehicles

### GET /vehicles

**Description:** Get paginated list of vehicles with optional filters

**Auth Required:** Yes (admin, manager, vehicle_owner, gate_security, driver)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| per_page | integer | No | Items per page (default: 15, max: 100) |
| search | string | No | Search by plate_number, manufacturer, model, VIN |
| status | string | No | Filter by status (active, maintenance, inactive, sold) |
| ownership_type | string | No | Filter by ownership (organization, individual) |
| individual_type | string | No | Filter by individual type (staff, visitor, vehicle_owner) |
| fuel_type | string | No | Filter by fuel type |
| manufacturer | string | No | Filter by manufacturer |
| year_from | integer | No | Filter by year from |
| year_to | integer | No | Filter by year to |
| sort_by | string | No | Sort by column (default: created_at) |
| sort_order | string | No | Sort order (asc, desc) (default: desc) |

**Example Request:**
```
GET /vehicles?page=1&per_page=15&search=Toyota&status=active&ownership_type=organization
```

**Success Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "manufacturer": "Toyota",
      "model": "Camry",
      "year": 2022,
      "plate_number": "ABC-123",
      "ownership_type": "organization",
      "individual_type": null,
      "color": "Blue",
      "vin": "1HGBH41JXMN109186",
      "status": "active",
      "fuel_type": "petrol",
      "seating_capacity": 5,
      "mileage": 15000.50,
      "purchase_date": "2022-01-15",
      "purchase_price": 25000.00,
      "photos": ["vehicles/photo1.jpg", "vehicles/photo2.jpg"],
      "primary_photo": "vehicles/photo1.jpg",
      "notes": "Company vehicle",
      "owner": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "driver": {
        "id": 1,
        "license_number": "DL12345",
        "user": {
          "id": 2,
          "name": "Driver Name",
          "email": "driver@example.com"
        }
      },
      "created_at": "2024-01-01T00:00:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z"
    }
  ],
  "current_page": 1,
  "last_page": 5,
  "per_page": 15,
  "total": 75,
  "from": 1,
  "to": 15
}
```

---

### GET /vehicles/{id}

**Description:** Get single vehicle details

**Auth Required:** Yes

**Success Response:** `200 OK`
```json
{
  "id": 1,
  "manufacturer": "Toyota",
  "model": "Camry",
  "year": 2022,
  "plate_number": "ABC-123",
  "ownership_type": "organization",
  "color": "Blue",
  "vin": "1HGBH41JXMN109186",
  "status": "active",
  "fuel_type": "petrol",
  "seating_capacity": 5,
  "mileage": 15000.50,
  "purchase_date": "2022-01-15",
  "purchase_price": 25000.00,
  "photos": ["vehicles/photo1.jpg"],
  "primary_photo": "vehicles/photo1.jpg",
  "notes": "Company vehicle",
  "owner": {...},
  "driver": {...},
  "creator": {...},
  "editor": {...}
}
```

**Error Response:** `404 Not Found`
```json
{
  "message": "Vehicle not found"
}
```

---

### POST /vehicles

**Description:** Create new vehicle

**Auth Required:** Yes (admin, manager, gate_security)

**Request Body:**
```json
{
  "manufacturer": "Toyota",
  "model": "Camry",
  "year": 2022,
  "plate_number": "ABC-123",
  "ownership_type": "organization",
  "individual_type": null,
  "owner_id": null,
  "color": "Blue",
  "vin": "1HGBH41JXMN109186",
  "status": "active",
  "fuel_type": "petrol",
  "seating_capacity": 5,
  "mileage": 0,
  "purchase_date": "2022-01-15",
  "purchase_price": 25000.00,
  "notes": "New company vehicle"
}
```

**Success Response:** `201 Created`
```json
{
  "message": "Vehicle created successfully",
  "vehicle": {
    "id": 1,
    "plate_number": "ABC-123",
    ...
  }
}
```

**Error Response:** `422 Unprocessable Entity`
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "plate_number": ["The plate number has already been taken."],
    "year": ["The year must be between 1900 and 2024."]
  }
}
```

---

### PUT /vehicles/{id}

**Description:** Update vehicle

**Auth Required:** Yes (admin, manager)

**Request Body:** (Same as POST, all fields optional)

**Success Response:** `200 OK`
```json
{
  "message": "Vehicle updated successfully",
  "vehicle": {...}
}
```

---

### DELETE /vehicles/{id}

**Description:** Delete vehicle

**Auth Required:** Yes (admin only)

**Success Response:** `200 OK`
```json
{
  "message": "Vehicle deleted"
}
```

---

### POST /vehicles/{id}/photos

**Description:** Upload vehicle photo

**Auth Required:** Yes (admin, manager)

**Request Body:** `multipart/form-data`
```
image: [file] (JPG, PNG, GIF, WEBP, max 5MB)
```

**Success Response:** `200 OK`
```json
{
  "message": "Photo uploaded successfully",
  "photo": "vehicles/1234567890.jpg",
  "photo_url": "http://localhost:8000/storage/vehicles/1234567890.jpg",
  "vehicle": {...}
}
```

---

### DELETE /vehicles/{id}/photos

**Description:** Delete vehicle photo

**Auth Required:** Yes (admin, manager)

**Request Body:**
```json
{
  "photo": "vehicles/1234567890.jpg"
}
```

**Success Response:** `200 OK`
```json
{
  "message": "Photo deleted successfully",
  "vehicle": {...}
}
```

---

### PUT /vehicles/{id}/photos/primary

**Description:** Set primary vehicle photo

**Auth Required:** Yes (admin, manager)

**Request Body:**
```json
{
  "photo": "vehicles/1234567890.jpg"
}
```

**Success Response:** `200 OK`
```json
{
  "message": "Primary photo updated successfully",
  "vehicle": {...}
}
```

---

## Drivers

### GET /drivers

**Description:** Get paginated list of drivers

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number |
| per_page | integer | No | Items per page |
| search | string | No | Search by name, license number, phone |
| vehicle_id | integer | No | Filter by assigned vehicle |
| driver_type | string | No | full_time, part_time, contract |
| sex | string | No | male, female |
| has_vehicle | boolean | No | true/false |

**Success Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 2,
      "vehicle_id": 1,
      "license_number": "DL12345",
      "license_expiry_date": "2025-12-31",
      "driver_type": "full_time",
      "sex": "male",
      "phone_number": "+1234567890",
      "home_address": "123 Main St",
      "user": {
        "id": 2,
        "name": "Driver Name",
        "email": "driver@example.com"
      },
      "vehicle": {
        "id": 1,
        "plate_number": "ABC-123",
        "manufacturer": "Toyota",
        "model": "Camry"
      }
    }
  ],
  "meta": {...}
}
```

---

### POST /drivers

**Description:** Create new driver

**Auth Required:** Yes (admin, manager, gate_security)

**Request Body:**
```json
{
  "user_id": 2,
  "license_number": "DL12345",
  "license_expiry_date": "2025-12-31",
  "driver_type": "full_time",
  "sex": "male",
  "phone_number": "+1234567890",
  "home_address": "123 Main St",
  "vehicle_id": null
}
```

**Success Response:** `201 Created`
```json
{
  "message": "Driver created successfully",
  "driver": {...}
}
```

---

## Maintenance

### GET /maintenance

**Description:** Get maintenance records

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search description, notes, vehicle |
| status | string | Pending, in_progress, Completed |
| vehicle_id | integer | Filter by vehicle |
| start_date | date | From date (YYYY-MM-DD) |
| end_date | date | To date (YYYY-MM-DD) |
| min_cost | decimal | Minimum cost |
| max_cost | decimal | Maximum cost |

**Success Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "vehicle_id": 1,
      "description": "Oil change and tire rotation",
      "status": "Completed",
      "cost": 150.00,
      "date": "2024-01-15",
      "notes": "Used synthetic oil",
      "attachments": [
        {
          "name": "receipt.pdf",
          "path": "maintenance-attachments/abc123.pdf",
          "type": "application/pdf",
          "size": 102400
        }
      ],
      "vehicle": {...},
      "expense": {...},
      "createdBy": {...},
      "updatedBy": {...}
    }
  ],
  "meta": {...}
}
```

---

### POST /maintenance

**Description:** Create maintenance record

**Auth Required:** Yes (admin, manager, vehicle_owner, driver)

**Request Body:**
```json
{
  "vehicle_id": 1,
  "description": "Oil change",
  "status": "Pending",
  "cost": 0,
  "date": "2024-01-15"
}
```

**Success Response:** `201 Created`

---

### POST /maintenance/{id}/attachments

**Description:** Upload maintenance attachment

**Auth Required:** Yes

**Request Body:** `multipart/form-data`
```
file: [file] (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, max 10MB)
```

**Success Response:** `200 OK`
```json
{
  "message": "Attachment uploaded successfully",
  "attachment": {
    "name": "receipt.pdf",
    "url": "http://localhost:8000/storage/maintenance-attachments/abc123.pdf",
    "type": "application/pdf",
    "size": 102400
  },
  "maintenance": {...}
}
```

---

## Expenses

### GET /expenses

**Description:** Get expense records

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search description, category |
| category | string | fuel, maintenance, insurance, repairs, other |
| vehicle_id | integer | Filter by vehicle |
| start_date | date | From date |
| end_date | date | To date |
| min_amount | decimal | Minimum amount |
| max_amount | decimal | Maximum amount |

**Success Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "vehicle_id": 1,
      "maintenance_id": null,
      "category": "fuel",
      "amount": 75.50,
      "description": "Full tank - Premium",
      "date": "2024-01-15",
      "vehicle": {...},
      "creator": {...}
    }
  ],
  "meta": {...}
}
```

---

### POST /expenses

**Description:** Create expense record

**Auth Required:** Yes (admin, manager, driver)

**Request Body:**
```json
{
  "vehicle_id": 1,
  "category": "fuel",
  "amount": 75.50,
  "description": "Full tank",
  "date": "2024-01-15"
}
```

**Success Response:** `201 Created`

---

## Trips

### GET /trips

**Description:** Get trip records

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search locations, purpose |
| status | string | pending, in_progress, completed |
| vehicle_id | integer | Filter by vehicle |
| driver_id | integer | Filter by driver |
| start_date | date | From date |
| end_date | date | To date |
| min_distance | decimal | Minimum distance |
| max_distance | decimal | Maximum distance |

**Success Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "vehicle_id": 1,
      "driver_id": 1,
      "start_location": "Office",
      "end_location": "Client Site",
      "start_time": "2024-01-15T08:00:00Z",
      "end_time": "2024-01-15T10:30:00Z",
      "distance": 45.5,
      "amount": 150.00,
      "status": "completed",
      "purpose": "Client meeting",
      "vehicle": {...},
      "driver": {...}
    }
  ],
  "meta": {...}
}
```

---

### POST /trips

**Description:** Create trip

**Auth Required:** Yes (admin, manager, driver)

**Request Body:**
```json
{
  "vehicle_id": 1,
  "driver_id": 1,
  "start_location": "Office",
  "end_location": "Client Site",
  "start_time": "2024-01-15T08:00:00Z",
  "end_time": null,
  "distance": 0,
  "amount": 0,
  "status": "in_progress",
  "purpose": "Client meeting"
}
```

**Success Response:** `201 Created`

---

## Check-Ins

### GET /checkins

**Description:** Get check-in/out records

**Auth Required:** Yes (admin, manager, gate_security)

**Success Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "vehicle_id": 1,
      "driver_id": 1,
      "checked_in_at": "2024-01-15T08:00:00Z",
      "checked_out_at": null,
      "purpose": "Delivery",
      "vehicle": {...},
      "driver": {...}
    }
  ]
}
```

---

### POST /checkins

**Description:** Check in vehicle

**Auth Required:** Yes (admin, manager, gate_security)

**Request Body:**
```json
{
  "vehicle_id": 1,
  "driver_id": 1,
  "purpose": "Delivery"
}
```

**Success Response:** `201 Created`

---

### POST /checkins/{id}/checkout

**Description:** Check out vehicle

**Auth Required:** Yes (admin, manager, gate_security)

**Success Response:** `200 OK`
```json
{
  "message": "Vehicle checked out successfully",
  "check_out": {...}
}
```

---

## Dashboard

### GET /dashboard/stats

**Description:** Get dashboard statistics

**Auth Required:** Yes

**Success Response:** `200 OK`
```json
{
  "total_vehicles": 50,
  "active_vehicles": 45,
  "total_drivers": 30,
  "active_trips": 5,
  "vehicles_within_premises": 12,
  "pending_maintenance": 3,
  "monthly_expenses": 15000.00,
  "monthly_income": 25000.00
}
```

---

### GET /dashboard/monthly-trends

**Description:** Get monthly trend data for charts

**Auth Required:** Yes (admin, manager)

**Success Response:** `200 OK`
```json
{
  "expenses": [
    {"month": "Jan", "amount": 5000},
    {"month": "Feb", "amount": 5500},
    ...
  ],
  "income": [
    {"month": "Jan", "amount": 8000},
    ...
  ],
  "trips": [
    {"month": "Jan", "count": 150},
    ...
  ]
}
```

---

## Reports

### GET /reports/vehicle/{id}/pdf

**Description:** Generate vehicle report PDF

**Auth Required:** Yes (admin, manager)

**Success Response:** `200 OK` (PDF file)

---

### POST /reports/expenses/pdf

**Description:** Generate expense report PDF

**Auth Required:** Yes (admin, manager)

**Request Body:**
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "vehicle_id": null
}
```

**Success Response:** `200 OK` (PDF file)

---

### POST /reports/expenses/excel

**Description:** Generate expense report Excel

**Auth Required:** Yes (admin, manager)

**Request Body:** (Same as PDF)

**Success Response:** `200 OK` (Excel file)

---

## Notifications

### GET /notifications

**Description:** Get user notifications

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| unread_only | boolean | Filter unread only |
| per_page | integer | Items per page (max 20) |

**Success Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "App\\Notifications\\MaintenanceReminderNotification",
      "data": {
        "maintenance_id": 1,
        "vehicle_plate": "ABC-123",
        "description": "Oil change",
        "date": "2024-01-20"
      },
      "read_at": null,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": {...}
}
```

---

### GET /notifications/unread-count

**Description:** Get unread notification count

**Auth Required:** Yes

**Success Response:** `200 OK`
```json
{
  "count": 5
}
```

---

### POST /notifications/{id}/read

**Description:** Mark notification as read

**Auth Required:** Yes

**Success Response:** `200 OK`
```json
{
  "message": "Notification marked as read",
  "notification": {...}
}
```

---

### POST /notifications/mark-all-read

**Description:** Mark all notifications as read

**Auth Required:** Yes

**Success Response:** `200 OK`
```json
{
  "message": "All notifications marked as read"
}
```

---

### DELETE /notifications/{id}

**Description:** Delete notification

**Auth Required:** Yes

**Success Response:** `200 OK`
```json
{
  "message": "Notification deleted"
}
```

---

## Error Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Malformed request |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Server maintenance |

---

## Rate Limiting

**Limits:**
- 60 requests per minute per user (authenticated)
- 20 requests per minute per IP (unauthenticated)

**Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

**Error Response:** `429 Too Many Requests`
```json
{
  "message": "Too many requests. Please try again later."
}
```

---

## Pagination

All list endpoints support pagination with these parameters:

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| page | integer | 1 | - | Current page |
| per_page | integer | 15 | 100 | Items per page |

**Response Meta:**
```json
{
  "data": [...],
  "current_page": 1,
  "last_page": 5,
  "per_page": 15,
  "total": 75,
  "from": 1,
  "to": 15
}
```

---

## Filtering & Searching

Most list endpoints support:

**Search:** General text search across multiple fields
```
GET /vehicles?search=Toyota
```

**Filtering:** Specific field filters
```
GET /vehicles?status=active&fuel_type=petrol
```

**Sorting:**
```
GET /vehicles?sort_by=year&sort_order=desc
```

**Date Ranges:**
```
GET /expenses?start_date=2024-01-01&end_date=2024-01-31
```

---

## Changelog

### Version 1.0 (2024-12-21)
- Initial API release
- All CRUD endpoints functional
- Authentication implemented
- Role-based access control
- File upload support
- PDF/Excel report generation
- Real-time notifications

---

## Support

**Email:** contact@basepan.com  
**Phone:** +1 (709) 771-8379  
**Hours:** Mon-Fri, 9AM-5PM EST

---

*Last Updated: December 21, 2024*