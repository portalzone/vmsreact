# VMS Testing Guide

## Overview

Comprehensive testing guide for the Vehicle Management System covering manual testing, automated testing, and quality assurance procedures.

**Version:** 1.0  
**Last Updated:** December 21, 2024  
**Audience:** QA Engineers, Developers, Testers

---

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Testing Environments](#testing-environments)
3. [Manual Testing](#manual-testing)
4. [Automated Testing](#automated-testing)
5. [API Testing](#api-testing)
6. [Frontend Testing](#frontend-testing)
7. [Performance Testing](#performance-testing)
8. [Security Testing](#security-testing)
9. [User Acceptance Testing](#user-acceptance-testing)
10. [Bug Reporting](#bug-reporting)
11. [Test Cases](#test-cases)
12. [Quality Metrics](#quality-metrics)

---

## Testing Strategy

### Testing Pyramid
```
         /\
        /  \  E2E Tests (10%)
       /----\
      /      \  Integration Tests (30%)
     /--------\
    /          \  Unit Tests (60%)
   /------------\
```

### Testing Types

**1. Unit Testing**
- Individual functions/methods
- Isolated components
- Mock dependencies
- Fast execution

**2. Integration Testing**
- Component interactions
- Database operations
- API endpoints
- Service integration

**3. End-to-End Testing**
- Complete user workflows
- Browser automation
- Cross-browser testing
- Real user scenarios

**4. Performance Testing**
- Load testing
- Stress testing
- Response times
- Resource usage

**5. Security Testing**
- Authentication
- Authorization
- SQL injection
- XSS prevention

---

## Testing Environments

### Environment Setup

**1. Local Development**
- URL: http://localhost:8000
- Database: vms_local
- Debug: Enabled
- Purpose: Development and initial testing

**2. Staging**
- URL: https://staging.myvms.basepan.com
- Database: vms_staging
- Debug: Disabled
- Purpose: Pre-production testing

**3. Production**
- URL: https://myvms.basepan.com
- Database: vms_production
- Debug: Disabled
- Purpose: Live environment (limited testing)

### Environment Configuration

**Local (.env.local):**
```env
APP_ENV=local
APP_DEBUG=true
DB_DATABASE=vms_local
```

**Staging (.env.staging):**
```env
APP_ENV=staging
APP_DEBUG=false
DB_DATABASE=vms_staging
```

**Production (.env.production):**
```env
APP_ENV=production
APP_DEBUG=false
DB_DATABASE=vms_production
```

---

## Manual Testing

### Pre-Testing Checklist

**Before Testing:**
- [ ] Environment is up and running
- [ ] Database is seeded with test data
- [ ] Test user accounts are available
- [ ] Browser cache is cleared
- [ ] DevTools console is open
- [ ] Network tab is monitoring requests

### Test User Accounts

**Test Credentials:**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.vms | password |
| Manager | manager@test.vms | password |
| Driver | driver@test.vms | password |
| Vehicle Owner | owner@test.vms | password |
| Gate Security | gate@test.vms | password |

### Smoke Testing Checklist

**Quick verification that critical features work:**

**Authentication:**
- [ ] Can login with valid credentials
- [ ] Cannot login with invalid credentials
- [ ] Can logout successfully
- [ ] Forgot password works
- [ ] Password reset works

**Navigation:**
- [ ] All menu items are accessible
- [ ] Dashboard loads
- [ ] Sidebar navigation works
- [ ] Breadcrumbs work
- [ ] Back button works

**CRUD Operations (Vehicles):**
- [ ] Can create new vehicle
- [ ] Can view vehicle list
- [ ] Can view vehicle details
- [ ] Can edit vehicle
- [ ] Can delete vehicle (admin only)

**Search & Filter:**
- [ ] Search works
- [ ] Filters apply correctly
- [ ] Pagination works
- [ ] Results update properly

**File Uploads:**
- [ ] Can upload vehicle photos
- [ ] Can upload maintenance documents
- [ ] Can upload expense receipts
- [ ] File validation works

---

## Automated Testing

### Backend Testing (Laravel)

**Setup PHPUnit:**
```bash
composer require --dev phpunit/phpunit
```

**phpunit.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit bootstrap="vendor/autoload.php"
         colors="true"
         stopOnFailure="false">
    <testsuites>
        <testsuite name="Feature">
            <directory>tests/Feature</directory>
        </testsuite>
        <testsuite name="Unit">
            <directory>tests/Unit</directory>
        </testsuite>
    </testsuites>
    <php>
        <env name="APP_ENV" value="testing"/>
        <env name="DB_CONNECTION" value="sqlite"/>
        <env name="DB_DATABASE" value=":memory:"/>
    </php>
</phpunit>
```

### Unit Tests

**Example: Vehicle Model Test**
```php
<?php
// tests/Unit/VehicleTest.php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;

class VehicleTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_create_a_vehicle()
    {
        $vehicle = Vehicle::factory()->create([
            'plate_number' => 'ABC-123',
            'manufacturer' => 'Toyota',
            'model' => 'Camry',
        ]);

        $this->assertDatabaseHas('vehicles', [
            'plate_number' => 'ABC-123',
        ]);
    }

    /** @test */
    public function it_requires_plate_number()
    {
        $this->expectException(\Illuminate\Database\QueryException::class);
        
        Vehicle::create([
            'manufacturer' => 'Toyota',
            'model' => 'Camry',
            // Missing plate_number
        ]);
    }

    /** @test */
    public function it_formats_plate_number_to_uppercase()
    {
        $vehicle = Vehicle::factory()->create([
            'plate_number' => 'abc-123',
        ]);

        $this->assertEquals('ABC-123', $vehicle->plate_number);
    }
}
```

### Feature Tests

**Example: Vehicle API Test**
```php
<?php
// tests/Feature/VehicleApiTest.php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Vehicle;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;

class VehicleApiTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function authenticated_user_can_view_vehicles()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $vehicles = Vehicle::factory(3)->create();

        $response = $this->getJson('/api/vehicles');

        $response->assertStatus(200)
                 ->assertJsonCount(3, 'data');
    }

    /** @test */
    public function guest_cannot_view_vehicles()
    {
        $response = $this->getJson('/api/vehicles');

        $response->assertStatus(401);
    }

    /** @test */
    public function admin_can_create_vehicle()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $vehicleData = [
            'manufacturer' => 'Toyota',
            'model' => 'Camry',
            'year' => 2022,
            'plate_number' => 'ABC-123',
            'ownership_type' => 'organization',
            'status' => 'active',
        ];

        $response = $this->postJson('/api/vehicles', $vehicleData);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'message',
                     'vehicle' => [
                         'id',
                         'plate_number',
                         'manufacturer',
                         'model',
                     ]
                 ]);

        $this->assertDatabaseHas('vehicles', [
            'plate_number' => 'ABC-123',
        ]);
    }

    /** @test */
    public function driver_cannot_delete_vehicle()
    {
        $driver = User::factory()->create();
        $driver->assignRole('driver');
        Sanctum::actingAs($driver);

        $vehicle = Vehicle::factory()->create();

        $response = $this->deleteJson("/api/vehicles/{$vehicle->id}");

        $response->assertStatus(403);
    }

    /** @test */
    public function vehicle_validation_works()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/vehicles', [
            // Missing required fields
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors([
                     'manufacturer',
                     'model',
                     'year',
                     'plate_number',
                 ]);
    }
}
```

### Running Tests

**Run All Tests:**
```bash
php artisan test
```

**Run Specific Test:**
```bash
php artisan test --filter VehicleApiTest
```

**Run with Coverage:**
```bash
php artisan test --coverage
```

**Run in Parallel:**
```bash
php artisan test --parallel
```

---

## API Testing

### Using Postman

**Setup:**
1. Download Postman
2. Import VMS API collection
3. Set environment variables

**Environment Variables:**
- `base_url`: http://localhost:8000/api
- `token`: Your authentication token

### API Test Collection

**Authentication Tests:**
```javascript
// POST /api/login
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    pm.response.to.have.jsonBody("token");
    
    // Save token
    pm.environment.set("token", pm.response.json().token);
});

pm.test("Response has user data", function () {
    const response = pm.response.json();
    pm.expect(response.user).to.have.property("id");
    pm.expect(response.user).to.have.property("email");
});
```

**Vehicle Tests:**
```javascript
// GET /api/vehicles
pm.test("Returns vehicle list", function () {
    pm.response.to.have.status(200);
    pm.response.to.have.jsonBody("data");
});

pm.test("Pagination meta present", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property("current_page");
    pm.expect(response).to.have.property("total");
});

// POST /api/vehicles
pm.test("Creates vehicle successfully", function () {
    pm.response.to.have.status(201);
    pm.response.to.have.jsonBody("vehicle");
});

pm.test("Returns created vehicle data", function () {
    const vehicle = pm.response.json().vehicle;
    pm.expect(vehicle).to.have.property("id");
    pm.expect(vehicle.plate_number).to.equal("ABC-123");
});
```

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@basepan.com","password":"password"}'
```

**Get Vehicles:**
```bash
curl -X GET http://localhost:8000/api/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create Vehicle:**
```bash
curl -X POST http://localhost:8000/api/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "manufacturer": "Toyota",
    "model": "Camry",
    "year": 2022,
    "plate_number": "ABC-123",
    "ownership_type": "organization"
  }'
```

---

## Frontend Testing

### Setup Jest & React Testing Library
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

**jest.config.js:**
```javascript
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};
```

### Component Tests

**Example: Login Component Test**
```jsx
// src/pages/Auth/__tests__/Login.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  test('renders login form', () => {
    renderLogin();
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    renderLogin();
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test('submits form with valid credentials', async () => {
    renderLogin();
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@basepan.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      // Assert redirect or success message
    });
  });
});
```

### Running Frontend Tests
```bash
npm test
```

**With Coverage:**
```bash
npm test -- --coverage
```

---

## Performance Testing

### Load Testing with Apache Bench

**Install:**
```bash
sudo apt install apache2-utils
```

**Basic Load Test:**
```bash
# 1000 requests, 10 concurrent
ab -n 1000 -c 10 https://myvms.basepan.com/
```

**With Authentication:**
```bash
ab -n 1000 -c 10 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.myvms.basepan.com/api/vehicles
```

**Expected Results:**
- Requests per second: > 100
- Time per request: < 100ms
- Failed requests: 0%

### Load Testing with Artillery

**Install:**
```bash
npm install -g artillery
```

**Test Configuration (load-test.yml):**
```yaml
config:
  target: 'https://api.myvms.basepan.com'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"
  defaults:
    headers:
      Authorization: 'Bearer YOUR_TOKEN'

scenarios:
  - name: "Get vehicles"
    flow:
      - get:
          url: "/api/vehicles"
      - think: 2
```

**Run Test:**
```bash
artillery run load-test.yml
```

### Database Query Performance

**Log Slow Queries:**
```php
// AppServiceProvider.php
use Illuminate\Support\Facades\DB;

DB::listen(function ($query) {
    if ($query->time > 1000) { // Log queries > 1 second
        Log::warning('Slow query detected', [
            'sql' => $query->sql,
            'time' => $query->time,
        ]);
    }
});
```

**Optimize Queries:**
```bash
php artisan telescope:install  # Install Laravel Telescope
```

---

## Security Testing

### Authentication Testing

**Test Cases:**

- [ ] Cannot access protected routes without token
- [ ] Token expires after configured time
- [ ] Logout revokes token
- [ ] Invalid token returns 401
- [ ] Password must meet complexity requirements
- [ ] Account locks after 5 failed attempts
- [ ] Password reset requires email verification

### Authorization Testing

**Test Cases:**

- [ ] Users can only access permitted resources
- [ ] Drivers can only see assigned vehicles
- [ ] Managers cannot delete vehicles
- [ ] Admins have full access
- [ ] API returns 403 for unauthorized actions

### SQL Injection Testing

**Test Inputs:**
```
' OR '1'='1
'; DROP TABLE vehicles;--
' UNION SELECT * FROM users--
```

**Expected:** All should be safely escaped, no SQL execution

### XSS Testing

**Test Inputs:**
```html
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<svg onload=alert('XSS')>
```

**Expected:** All should be escaped in output

### CSRF Testing

**Test:**
1. Attempt POST request without CSRF token
2. Expected: 419 error

### File Upload Security

**Test Cases:**

- [ ] Only allowed file types accepted
- [ ] File size limits enforced
- [ ] Malicious files rejected
- [ ] Files stored outside public directory
- [ ] Filenames sanitized

---

## User Acceptance Testing

### UAT Process

**1. Preparation**
- Define acceptance criteria
- Prepare test data
- Set up test environment
- Train UAT testers

**2. Test Execution**
- Users perform real-world scenarios
- Document any issues
- Collect feedback
- Verify all requirements met

**3. Sign-Off**
- Review test results
- Address critical issues
- Get stakeholder approval
- Prepare for production

### UAT Test Scenarios

**Scenario 1: Vehicle Management**

**Objective:** Verify complete vehicle lifecycle

**Steps:**
1. Login as admin
2. Add new vehicle with all details
3. Upload vehicle photos
4. Assign driver to vehicle
5. View vehicle details
6. Edit vehicle information
7. Generate vehicle report

**Expected Result:** All operations complete successfully

---

**Scenario 2: Trip Workflow**

**Objective:** Verify trip creation and completion

**Steps:**
1. Login as driver
2. Create new trip
3. Start trip
4. Update trip during journey
5. Complete trip with expenses
6. View trip report

**Expected Result:** Trip tracked accurately, data saved

---

**Scenario 3: Maintenance Tracking**

**Objective:** Verify maintenance scheduling and completion

**Steps:**
1. Schedule maintenance for vehicle
2. Receive notification reminder
3. Update status to "In Progress"
4. Complete maintenance
5. Upload invoice
6. Verify expense auto-created

**Expected Result:** Maintenance tracked, notifications sent

---

## Bug Reporting

### Bug Report Template
```markdown
**Title:** [Clear, descriptive title]

**Priority:** Critical / High / Medium / Low

**Environment:** Production / Staging / Development

**URL:** https://myvms.basepan.com/page

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Result:**
What should happen

**Actual Result:**
What actually happened

**Screenshots:**
[Attach screenshots]

**Browser:** Chrome 120.0 / Firefox 121.0 / Safari 17.0

**Device:** Desktop / Mobile (specify)

**Console Errors:**
```
[Paste console errors]
```

**Additional Info:**
Any other relevant information
```

### Bug Severity Levels

**Critical (P0):**
- System completely down
- Data loss occurring
- Security breach
- Major functionality broken

**High (P1):**
- Major feature not working
- Workaround exists but difficult
- Affects many users

**Medium (P2):**
- Minor feature issue
- Easy workaround available
- Affects few users

**Low (P3):**
- Cosmetic issues
- Minor inconvenience
- Enhancement request

---

## Test Cases

### Authentication Test Cases

| TC ID | Test Case | Steps | Expected Result | Status |
|-------|-----------|-------|-----------------|--------|
| AUTH-001 | Login with valid credentials | 1. Enter email<br>2. Enter password<br>3. Click login | Redirect to dashboard | ✅ |
| AUTH-002 | Login with invalid email | 1. Enter wrong email<br>2. Enter password<br>3. Click login | Error: Invalid credentials | ✅ |
| AUTH-003 | Login with invalid password | 1. Enter email<br>2. Enter wrong password<br>3. Click login | Error: Invalid credentials | ✅ |
| AUTH-004 | Logout | 1. Click logout button | Redirect to login, token revoked | ✅ |
| AUTH-005 | Forgot password | 1. Click forgot password<br>2. Enter email<br>3. Submit | Reset link sent to email | ✅ |

### Vehicle Management Test Cases

| TC ID | Test Case | Steps | Expected Result | Status |
|-------|-----------|-------|-----------------|--------|
| VEH-001 | Create vehicle | 1. Click Add Vehicle<br>2. Fill form<br>3. Submit | Vehicle created successfully | ✅ |
| VEH-002 | Create duplicate plate | 1. Try to create vehicle with existing plate | Error: Plate already exists | ✅ |
| VEH-003 | Edit vehicle | 1. Open vehicle<br>2. Click edit<br>3. Update fields<br>4. Save | Changes saved | ✅ |
| VEH-004 | Delete vehicle (admin) | 1. Select vehicle<br>2. Click delete<br>3. Confirm | Vehicle deleted | ✅ |
| VEH-005 | Delete vehicle (manager) | 1. Select vehicle<br>2. Click delete | Error: Forbidden | ✅ |
| VEH-006 | Upload photo | 1. Open vehicle<br>2. Upload image | Photo added to gallery | ✅ |
| VEH-007 | Upload invalid file | 1. Try to upload .exe file | Error: Invalid file type | ✅ |

### Full Test Suite Template

Download complete test suite: [VMS_Test_Cases.xlsx](link)

---

## Quality Metrics

### Code Coverage

**Target:** 80% minimum

**Check Coverage:**
```bash
php artisan test --coverage
```

**Coverage by Type:**
- Unit Tests: > 90%
- Feature Tests: > 80%
- Integration Tests: > 70%

### Performance Metrics

**Response Times:**
- Page Load: < 2 seconds
- API Calls: < 500ms
- Database Queries: < 100ms

**Throughput:**
- Concurrent Users: 100+
- Requests/Second: 100+

### Bug Metrics

**Track:**
- Bugs found per release
- Bugs fixed per sprint
- Bug resolution time
- Bug reopen rate

**Targets:**
- Critical bugs: 0 in production
- Bug fix time: < 24 hours (critical)
- Reopen rate: < 5%

---

## Continuous Integration

### GitHub Actions Example

**.github/workflows/tests.yml:**
```yaml
name: Tests

on: [push, pull_request]

jobs:
  tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: 8.1
          extensions: mbstring, xml, ctype, json, bcmath, pdo_mysql
      
      - name: Install Dependencies
        run: composer install
      
      - name: Run Tests
        run: php artisan test
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v2
```

---

## Testing Checklist

### Pre-Release Checklist

**Functionality:**
- [ ] All features work as expected
- [ ] No critical bugs
- [ ] All user roles tested
- [ ] Edge cases handled

**Performance:**
- [ ] Page load times acceptable
- [ ] API response times good
- [ ] Database queries optimized
- [ ] No memory leaks

**Security:**
- [ ] Authentication works
- [ ] Authorization enforced
- [ ] Input validation working
- [ ] File uploads secure
- [ ] No XSS vulnerabilities
- [ ] No SQL injection possible

**Compatibility:**
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge
- [ ] Mobile responsive

**Data:**
- [ ] Backups working
- [ ] Data integrity maintained
- [ ] Migrations successful
- [ ] Seeders working

**Documentation:**
- [ ] User manual updated
- [ ] API docs current
- [ ] Changelog updated
- [ ] README accurate

---

## Resources

**Testing Tools:**
- PHPUnit: https://phpunit.de/
- Jest: https://jestjs.io/
- Postman: https://www.postman.com/
- Artillery: https://artillery.io/

**Documentation:**
- Laravel Testing: https://laravel.com/docs/testing
- React Testing Library: https://testing-library.com/react

---

**Contact Testing Team:**
- Email: contact@basepan.com
- Slack: #vms-testing

---

*Last Updated: December 21, 2024*  
*Version: 1.0*