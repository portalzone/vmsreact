# VMS User Manual

## Welcome to the Vehicle Management System

This manual will guide you through all features of the VMS platform.

**Version:** 1.0  
**Last Updated:** December 21, 2024  
**Audience:** End Users (All Roles)

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [User Interface Overview](#user-interface-overview)
3. [Dashboard](#dashboard)
4. [Managing Vehicles](#managing-vehicles)
5. [Managing Drivers](#managing-drivers)
6. [Check-In/Check-Out](#check-incheck-out)
7. [Maintenance Tracking](#maintenance-tracking)
8. [Expense Management](#expense-management)
9. [Trip Management](#trip-management)
10. [Income Tracking](#income-tracking)
11. [Reports & Analytics](#reports--analytics)
12. [Notifications](#notifications)
13. [Profile Settings](#profile-settings)
14. [Mobile Access](#mobile-access)
15. [Tips & Best Practices](#tips--best-practices)
16. [Troubleshooting](#troubleshooting)
17. [Keyboard Shortcuts](#keyboard-shortcuts)
18. [Glossary](#glossary)
19. [Support](#support)

---

## Getting Started

### System Requirements

**Supported Browsers:**
- Google Chrome 90+ (Recommended)
- Mozilla Firefox 88+
- Microsoft Edge 90+
- Safari 14+

**Internet Connection:**
- Minimum: 1 Mbps
- Recommended: 5 Mbps or higher

**Screen Resolution:**
- Minimum: 1024x768
- Recommended: 1920x1080

### Accessing VMS

1. Open your web browser
2. Navigate to: `https://myvms.basepan.com`
3. You'll see the login page

### First Time Login

**Step 1: Login**
1. Enter your email address
2. Enter your password
3. Click **"Login"** button

**Step 2: Update Profile**
1. Click on your name in the top right corner
2. Select **"Profile"**
3. Upload a profile picture (optional)
4. Update your contact information
5. Click **"Save Changes"**

**Step 3: Set Notification Preferences**
1. Go to **Profile → Settings → Notifications**
2. Toggle notifications you want to receive:
   - ✅ Maintenance Reminders
   - ✅ Expense Alerts
   - ✅ Trip Completions
   - ✅ Weekly Summary
3. Click **"Save Preferences"**

### Forgot Password?

1. Click **"Forgot Password?"** on login page
2. Enter your email address
3. Click **"Send Reset Link"**
4. Check your email for reset instructions
5. Click the link in the email
6. Create a new password
7. Click **"Reset Password"**

---

## User Interface Overview

### Main Navigation

**Sidebar Menu (Left):**
- 📊 Dashboard
- 🚗 Vehicles
- 👨‍✈️ Drivers
- 👥 Users
- 🚪 Check-Ins
- 🗺️ Trips
- 🔧 Maintenance
- 💸 Expenses
- 💰 Income
- 📊 Analytics
- 📄 Reports
- 📋 Audit Trail
- 🔔 Notifications

**Top Bar:**
- Search box (global search)
- Notification bell (🔔) with unread count
- User avatar and name
- Profile dropdown

### Common Elements

**Buttons:**
- 🔵 **Primary Button** - Main action (Save, Create, Submit)
- ⚪ **Secondary Button** - Alternative action (Cancel, Back)
- 🔴 **Danger Button** - Destructive action (Delete)

**Icons:**
- ✏️ Edit - Modify record
- 🗑️ Delete - Remove record
- 👁️ View - See details
- 📄 Download - Export file
- 🔍 Search - Find records

**Status Indicators:**
- 🟢 Green - Active, Completed, Success
- 🟡 Yellow - Pending, In Progress, Warning
- 🔴 Red - Inactive, Failed, Error
- ⚫ Gray - Disabled, Archived

---

## Dashboard

The dashboard provides an overview of your fleet operations.

### Dashboard Sections

**1. Quick Stats (Top Row)**
- **Total Vehicles** - All vehicles in system
- **Active Trips** - Currently ongoing trips
- **Pending Maintenance** - Maintenance scheduled
- **Monthly Expenses** - Total expenses this month

**2. Recent Activity**
- Latest check-ins/check-outs
- Recent trips
- Recent maintenance
- Recent expenses

**3. Charts & Graphs**
- Monthly expense trends (line chart)
- Expense breakdown by category (pie chart)
- Trip statistics (bar chart)
- Vehicle utilization

**4. Notifications**
- Important alerts
- Upcoming maintenance
- Overdue tasks

### Customizing Dashboard

1. Click **⚙️ Settings** icon on dashboard
2. Toggle widgets on/off:
   - ☑️ Quick Stats
   - ☑️ Recent Activity
   - ☑️ Charts
   - ☑️ Notifications
3. Drag widgets to rearrange
4. Click **"Save Layout"**

---

## Managing Vehicles

### Viewing Vehicles

**Access:** Click **"Vehicles"** in sidebar

**Vehicle List:**
- Shows all vehicles you have access to
- Displays: Photo, Plate Number, Make/Model, Year, Status

**Filter Vehicles:**
1. Use the filter panel (top right)
2. Filter by:
   - Status (Active, Maintenance, Inactive)
   - Ownership Type (Organization, Individual)
   - Fuel Type
   - Manufacturer
   - Year Range
3. Click **"Apply Filters"**

**Search Vehicles:**
1. Type in search box
2. Searches: Plate Number, Make, Model, VIN
3. Results update automatically

### Adding a New Vehicle

**Permissions Required:** Admin, Manager, Gate Security

**Steps:**

1. Click **"Add New Vehicle"** button
2. Fill in required information:

**Basic Information (Required):**
- **Manufacturer:** e.g., Toyota, Honda, Ford
- **Model:** e.g., Camry, Civic, F-150
- **Year:** Manufacturing year
- **Plate Number:** License plate (must be unique)
- **Ownership Type:** 
  - Organization (company-owned)
  - Individual (staff, visitor, vehicle owner)

**Additional Information (Optional):**
- Color
- VIN (Vehicle Identification Number)
- Fuel Type (Petrol, Diesel, Electric, Hybrid, CNG, LPG)
- Seating Capacity
- Current Mileage
- Purchase Date
- Purchase Price
- Notes

3. Click **"Save"**

**Success:** You'll see a confirmation message and the vehicle will appear in the list.

### Editing a Vehicle

1. Find the vehicle in the list
2. Click **✏️ Edit** button
3. Update the information
4. Click **"Save Changes"**

**Note:** Some fields may be restricted based on your role.

### Viewing Vehicle Details

1. Click on a vehicle in the list
2. You'll see:
   - **Overview Tab:** All vehicle information
   - **Photos Tab:** Vehicle images
   - **Maintenance Tab:** Maintenance history
   - **Expenses Tab:** Associated expenses
   - **Trips Tab:** Trip history
   - **Documents Tab:** Uploaded documents

### Managing Vehicle Photos

**Upload Photos:**
1. Go to vehicle details
2. Click **"Photos"** tab
3. Click **"Upload Photo"** button
4. Select image file (JPG, PNG, GIF, WEBP)
   - Max size: 5MB
   - Min dimensions: 100x100px
5. Click **"Upload"**

**Set Primary Photo:**
1. Click on any photo
2. Click **"Set as Primary"** button
3. This photo will show in vehicle lists

**Delete Photo:**
1. Click on photo
2. Click **🗑️ Delete** icon
3. Confirm deletion

### Vehicle Status

**Status Types:**
- 🟢 **Active** - In service
- 🟡 **Maintenance** - Under repair
- 🔴 **Inactive** - Not in use
- ⚫ **Sold** - Sold/disposed

**Change Status:**
1. Edit vehicle
2. Select new status from dropdown
3. Save changes

---

## Managing Drivers

### Viewing Drivers

**Access:** Click **"Drivers"** in sidebar

**Driver List Shows:**
- Photo
- Name
- License Number
- Assigned Vehicle
- Contact Info

### Adding a Driver

**Permissions Required:** Admin, Manager, Gate Security

**Steps:**

1. Click **"Add New Driver"**
2. Fill in information:

**Required:**
- **Name:** Full name
- **Email:** Email address (must be unique)
- **License Number:** Driver's license number
- **License Expiry Date:** When license expires

**Optional:**
- Driver Type (Full-time, Part-time, Contract)
- Gender
- Phone Number
- Home Address
- Assigned Vehicle

3. Click **"Save"**

**Note:** System will create a user account for the driver with the email provided.

### Editing Driver Information

1. Find driver in list
2. Click **✏️ Edit**
3. Update information
4. Click **"Save Changes"**

### Assigning Vehicle to Driver

**Method 1: From Driver Page**
1. Edit driver
2. Select vehicle from **"Assigned Vehicle"** dropdown
3. Save changes

**Method 2: From Vehicle Page**
1. Edit vehicle
2. Select driver from **"Assigned Driver"** dropdown
3. Save changes

**Note:** One driver can be assigned to one vehicle at a time.

### Unassigning Vehicle

1. Edit driver
2. Set **"Assigned Vehicle"** to "None"
3. Save changes

### Viewing Driver Details

Click on a driver to see:
- **Profile:** Personal information
- **Assigned Vehicle:** Current vehicle
- **Trip History:** All trips by this driver
- **Performance:** Stats and metrics

---

## Check-In/Check-Out

The check-in/check-out system tracks when vehicles enter and leave premises.

### Checking In a Vehicle

**Permissions Required:** Admin, Manager, Gate Security

**Steps:**

1. Click **"Check-Ins"** in sidebar
2. Click **"New Check-In"** button
3. Fill in details:
   - **Vehicle:** Select from dropdown or search by plate number
   - **Driver:** Select driver (optional)
   - **Purpose:** Reason for visit (e.g., "Delivery", "Client Meeting")
4. Click **"Check In"**

**Success:** Vehicle is now marked as "within premises"

### Checking Out a Vehicle

1. Go to **"Check-Ins"**
2. Find the active check-in
3. Click **"Check Out"** button
4. Confirm checkout

**Success:** Vehicle is marked as departed, duration is calculated

### Viewing Vehicles Within Premises

**Access:** Click **"Vehicles Within"** in sidebar (if visible)

**Shows:**
- All currently checked-in vehicles
- Driver information
- Check-in time
- Duration on premises
- Purpose of visit

**Filter Options:**
- By vehicle
- By driver
- By date range
- By purpose

### Check-In History

1. Go to **"Check-Ins"**
2. Use filters to view:
   - Active check-ins (not checked out)
   - Completed check-ins
   - By date range
   - By vehicle
   - By driver

---

## Maintenance Tracking

Keep track of all vehicle maintenance, repairs, and services.

### Viewing Maintenance Records

**Access:** Click **"Maintenance"** in sidebar

**List Shows:**
- Vehicle information
- Description
- Status
- Scheduled/Completed date
- Cost

### Scheduling Maintenance

**Permissions Required:** Admin, Manager, Vehicle Owner, Driver

**Steps:**

1. Click **"Schedule Maintenance"**
2. Fill in details:

**Required:**
- **Vehicle:** Select vehicle
- **Description:** What needs to be done (e.g., "Oil change", "Tire rotation")
- **Date:** When it's scheduled

**Optional:**
- **Estimated Cost:** Expected cost
- **Notes:** Additional information

3. Click **"Schedule"**

**Automatic Reminders:**
- System sends email reminders 3 days before scheduled date
- Notifications appear in dashboard

### Recording Completed Maintenance

1. Find the maintenance record
2. Click **✏️ Edit**
3. Change status to **"Completed"**
4. Enter:
   - **Actual Cost:** Final cost
   - **Completion Date:** When it was done
   - **Notes:** Work performed
5. Upload receipts (optional)
6. Click **"Save"**

**Auto-Expense:** System automatically creates an expense record for completed maintenance.

### Uploading Maintenance Documents

1. Open maintenance record
2. Click **"Attachments"** tab
3. Click **"Upload Document"**
4. Select file:
   - Supported: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
   - Max size: 10MB
5. Click **"Upload"**

### Maintenance Status

**Status Types:**
- 🟡 **Pending** - Scheduled, not started
- 🔵 **In Progress** - Currently being worked on
- 🟢 **Completed** - Finished

### Filtering Maintenance Records

**Filter By:**
- Status
- Vehicle
- Date Range
- Cost Range
- Search (description, notes)

---

## Expense Management

Track all vehicle-related expenses.

### Viewing Expenses

**Access:** Click **"Expenses"** in sidebar

**List Shows:**
- Date
- Vehicle
- Category
- Amount
- Description

### Adding an Expense

**Permissions Required:** Admin, Manager, Driver

**Steps:**

1. Click **"Add Expense"**
2. Fill in details:

**Required:**
- **Vehicle:** Select vehicle
- **Category:** Choose from:
  - ⛽ Fuel
  - 🔧 Maintenance
  - 📄 Insurance
  - 🔨 Repairs
  - 📦 Other
- **Amount:** Cost (₦)
- **Date:** Expense date

**Optional:**
- **Description:** Details about expense
- **Receipt:** Upload receipt image/PDF

3. Click **"Save"**

**Expense Alert:**
- If amount exceeds ₦50,000, system sends alert to admins and managers

### Expense Categories

**Fuel:**
- Gas station purchases
- Fuel cards
- Diesel, petrol, electric charging

**Maintenance:**
- Oil changes
- Tire rotations
- Regular servicing
- *Note:* Auto-created when maintenance is completed

**Insurance:**
- Policy premiums
- Insurance renewals
- Claims

**Repairs:**
- Body work
- Engine repairs
- Part replacements
- Emergency repairs

**Other:**
- Parking fees
- Tolls
- Cleaning
- Accessories
- Miscellaneous

### Uploading Receipts

1. When adding/editing expense
2. Click **"Upload Receipt"**
3. Select file (JPG, PNG, PDF)
   - Max size: 5MB
4. File is attached to expense

### Viewing Expense Reports

1. Click **"Reports"** in sidebar
2. Select **"Expense Report"**
3. Set filters:
   - Date range
   - Vehicle
   - Category
   - Amount range
4. Click **"Generate"**
5. View online or download (PDF/Excel)

### Exporting Expenses

1. Go to Expenses list
2. Apply desired filters
3. Click **"Export"** button
4. Choose format:
   - 📄 PDF
   - 📊 Excel (XLSX)
5. File downloads automatically

---

## Trip Management

Plan, track, and manage vehicle trips.

### Viewing Trips

**Access:** Click **"Trips"** in sidebar

**List Shows:**
- Vehicle and driver
- Route (start → end location)
- Date/Time
- Distance
- Amount
- Status

### Creating a Trip

**Permissions Required:** Admin, Manager, Driver

**Steps:**

1. Click **"Create Trip"**
2. Fill in details:

**Required:**
- **Vehicle:** Select vehicle
- **Driver:** Select driver
- **Start Location:** Where trip begins
- **End Location:** Destination
- **Start Time:** When trip starts

**Optional:**
- **Purpose:** Reason for trip
- **Expected Distance:** Estimated km/miles
- **Expected Amount:** Estimated cost

3. Click **"Start Trip"**

**Status:** Trip is now "In Progress"

### Updating Trip During Journey

**Drivers can update:**
1. Open active trip
2. Add notes
3. Update estimated arrival
4. Report issues
5. Save changes

### Completing a Trip

1. Find active trip
2. Click **"Complete Trip"**
3. Fill in:
   - **End Time:** Actual arrival time
   - **Distance:** Actual distance traveled
   - **Fuel Used:** Amount of fuel consumed
   - **Expenses:** Any trip-related costs
   - **Notes:** Trip summary
4. Click **"Complete"**

**Auto-Actions:**
- Status changes to "Completed"
- Duration calculated automatically
- Income record created (if amount specified)
- Trip completion notification sent

### Trip Status

**Status Types:**
- 🟡 **Pending** - Scheduled, not started
- 🔵 **In Progress** - Currently active
- 🟢 **Completed** - Finished

### Filtering Trips

**Filter By:**
- Status
- Vehicle
- Driver
- Date range
- Location (start/end)
- Distance range
- Amount range

---

## Income Tracking

Record income from trips and other sources.

### Viewing Income

**Access:** Click **"Income"** in sidebar

**List Shows:**
- Date
- Source
- Amount
- Related trip (if any)
- Description

### Adding Income

**Permissions Required:** Admin, Manager

**Steps:**

1. Click **"Add Income"**
2. Fill in details:

**Required:**
- **Amount:** Income amount (₦)
- **Source:** Where income came from
- **Date:** Income date

**Optional:**
- **Trip:** Link to related trip
- **Description:** Additional details

3. Click **"Save"**

### Auto-Generated Income

**Trip Income:**
- When trip is completed with an amount
- System auto-creates income record
- Linked to the trip

### Income Reports

1. Go to **"Reports"**
2. Select **"Income Report"**
3. Set date range
4. Click **"Generate"**
5. Download PDF or Excel

### Monthly Income Summary

**Dashboard Shows:**
- Current month total income
- Comparison with previous month
- Trend chart

---

## Reports & Analytics

Generate comprehensive reports and view analytics.

### Available Reports

**1. Vehicle Report**
- All vehicle information
- Maintenance history
- Expense breakdown
- Trip summary

**2. Expense Report**
- Detailed expense list
- Category breakdown
- Time-based analysis
- Cost trends

**3. Maintenance Report**
- All maintenance records
- Costs analysis
- Upcoming maintenance
- Overdue items

**4. Trip Report**
- Trip history
- Distance traveled
- Routes analysis
- Driver performance

**5. Income Report**
- Income sources
- Monthly breakdown
- Trends and projections

### Generating Reports

**Steps:**

1. Click **"Reports"** in sidebar
2. Select report type
3. Set parameters:
   - **Date Range:** Start and end dates
   - **Vehicle:** Specific vehicle or all
   - **Filters:** Additional filters
4. Click **"Generate Report"**
5. Report displays on screen

### Downloading Reports

**PDF Format:**
1. Generate report
2. Click **"Download PDF"**
3. File saves to Downloads folder

**Excel Format:**
1. Generate report
2. Click **"Download Excel"**
3. XLSX file downloads

### Analytics Dashboard

**Access:** Click **"Analytics"** in sidebar

**Available Charts:**

**1. Trip Statistics**
- Total trips per month
- Distance trends
- Most used routes

**2. Expense Analysis**
- Category breakdown (pie chart)
- Monthly trends (line chart)
- Top spending vehicles

**3. Vehicle Utilization**
- Active vs inactive
- Usage hours
- Idle time

**4. Maintenance Trends**
- Scheduled vs completed
- Cost over time
- Vehicle reliability

### Customizing Analytics View

1. Click **⚙️ Settings** on Analytics page
2. Select:
   - Date range (Last 7 days, 30 days, 3 months, Year, Custom)
   - Chart types
   - Metrics to display
3. Click **"Apply"**

---

## Notifications

Stay informed with real-time notifications.

### Notification Types

**🔧 Maintenance Reminders**
- 3 days before scheduled maintenance
- Overdue maintenance alerts
- Maintenance completed notifications

**⚠️ Expense Alerts**
- High-value expenses (>₦50,000)
- Budget threshold warnings
- Unusual spending patterns

**✅ Trip Completions**
- Trip successfully completed
- Trip summary

**📊 Weekly Summary**
- Every Monday at 8 AM
- Week's activities overview
- Key metrics

### Viewing Notifications

**Notification Bell (🔔):**
1. Click bell icon in top bar
2. Shows recent notifications
3. Red badge shows unread count

**Notifications Page:**
1. Click **"Notifications"** in sidebar
2. View all notifications
3. Filter by:
   - All
   - Unread
   - Read

### Managing Notifications

**Mark as Read:**
1. Click on notification
2. Automatically marked as read

**Mark All as Read:**
1. Go to Notifications page
2. Click **"Mark All as Read"**

**Delete Notification:**
1. Hover over notification
2. Click **🗑️ Delete** icon
3. Notification removed

### Notification Preferences

**Customize what you receive:**

1. Go to **Profile → Settings → Notifications**
2. Toggle each type:
   - ☑️ Maintenance Reminders
   - ☑️ Expense Alerts
   - ☑️ Trip Completions
   - ☑️ Weekly Summary
3. Click **"Save Preferences"**

**Email Notifications:**
- Sent to your registered email
- Same as in-app notifications
- Can be disabled per type

---

## Profile Settings

Manage your account and preferences.

### Accessing Profile

1. Click your avatar/name (top right)
2. Select **"Profile"**

### Profile Tabs

**1. Overview**
- Your information
- Account details
- Login history

**2. Edit Profile**
- Update personal information
- Change contact details
- Upload avatar

**3. Change Password**
- Security settings
- Password update

**4. Notifications**
- Notification preferences
- Email settings

### Updating Profile Information

1. Go to **Profile → Edit**
2. Update:
   - Name
   - Email
   - Phone Number
3. Click **"Save Changes"**

### Changing Profile Picture

1. Go to **Profile → Edit**
2. Click on avatar or **"Upload Photo"**
3. Select image file:
   - Supported: JPG, PNG, GIF
   - Max size: 2MB
   - Recommended: Square image, 300x300px minimum
4. Crop if needed
5. Click **"Save"**

### Changing Password

**Important:** Use a strong password with:
- At least 8 characters
- Mix of uppercase and lowercase
- Numbers
- Special characters

**Steps:**

1. Go to **Profile → Change Password**
2. Enter:
   - **Current Password**
   - **New Password**
   - **Confirm New Password**
3. Click **"Update Password"**

**Success:** Password changed, you'll receive confirmation email.

### Viewing Login History

1. Go to **Profile → Overview**
2. Scroll to **"Recent Activity"**
3. See:
   - Login times
   - IP addresses
   - Devices used

**Security Tip:** If you see unfamiliar logins, change your password immediately.

---

## Mobile Access

VMS is mobile-responsive and works on smartphones and tablets.

### Mobile Browser Access

1. Open browser on mobile device
2. Go to: `https://myvms.basepan.com`
3. Login with credentials
4. Interface adapts to screen size

### Mobile Features

**✅ Available:**
- Dashboard view
- Check-in/check-out vehicles
- View vehicles and drivers
- Create expenses
- Update trips
- View notifications
- Respond to alerts

**❌ Limited:**
- Complex reports (best on desktop)
- Bulk operations
- Advanced analytics

### Mobile Tips

**For Best Experience:**
- Use Chrome or Safari browser
- Landscape mode for tables
- Zoom for detailed views
- Save to home screen for quick access

**Save to Home Screen:**

**iOS (iPhone/iPad):**
1. Open VMS in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Tap "Add"

**Android:**
1. Open VMS in Chrome
2. Tap ⋮ (menu)
3. Select "Add to Home screen"
4. Tap "Add"

---

## Tips & Best Practices

### General Best Practices

**1. Keep Information Updated**
- ✅ Update vehicle mileage regularly
- ✅ Record expenses promptly
- ✅ Complete trips immediately after arrival
- ✅ Update maintenance status

**2. Use Consistent Data Entry**
- ✅ Use standard formats for plate numbers
- ✅ Consistent location naming
- ✅ Descriptive maintenance notes
- ✅ Clear expense descriptions

**3. Upload Supporting Documents**
- ✅ Receipts for expenses
- ✅ Maintenance invoices
- ✅ Insurance documents
- ✅ Registration papers

**4. Regular Reviews**
- ✅ Check notifications daily
- ✅ Review expenses weekly
- ✅ Confirm upcoming maintenance
- ✅ Monitor trip reports

### Time-Saving Tips

**🚀 Quick Actions:**
- Use global search (top bar) to find anything quickly
- Bookmark frequently used reports
- Set up email notifications for important events
- Use filters to narrow down large lists

**⌨️ Keyboard Shortcuts:**
- `Ctrl + K` - Global search
- `Ctrl + N` - New record (on list pages)
- `Esc` - Close modal/dialog
- `Ctrl + S` - Save form (when editing)

### Data Quality Tips

**For Accurate Reports:**
1. Enter expenses on the same day they occur
2. Include detailed descriptions
3. Categorize expenses correctly
4. Link maintenance to expenses
5. Complete all required fields

---

## Troubleshooting

### Common Issues

#### 1. Can't Login

**Problem:** Invalid credentials or error message

**Solutions:**
- ✅ Check Caps Lock is off
- ✅ Verify email is correct
- ✅ Use "Forgot Password" to reset
- ✅ Clear browser cache and cookies
- ✅ Try different browser
- ✅ Contact administrator

#### 2. Page Not Loading

**Problem:** Blank screen or loading forever

**Solutions:**
- ✅ Refresh page (F5 or Ctrl+R)
- ✅ Check internet connection
- ✅ Clear browser cache
- ✅ Try incognito/private mode
- ✅ Check if site is down (ask colleague)

#### 3. Can't Upload File

**Problem:** Upload fails or shows error

**Solutions:**
- ✅ Check file size (must be under limit)
- ✅ Verify file type is supported
- ✅ Ensure file isn't corrupted
- ✅ Try different file
- ✅ Check internet connection

#### 4. Data Not Saving

**Problem:** Changes don't persist after saving

**Solutions:**
- ✅ Check for validation errors (red text)
- ✅ Fill all required fields (marked with *)
- ✅ Wait for success message
- ✅ Don't navigate away before saving
- ✅ Check internet connection

#### 5. Can't See Expected Data

**Problem:** Missing vehicles, trips, or records

**Solutions:**
- ✅ Check filters are not limiting results
- ✅ Clear all filters
- ✅ Verify date range
- ✅ Check you have permission to view
- ✅ Confirm data was actually created

#### 6. Slow Performance

**Problem:** Site is slow or laggy

**Solutions:**
- ✅ Close unused browser tabs
- ✅ Clear browser cache
- ✅ Check internet speed
- ✅ Disable browser extensions
- ✅ Use modern browser version
- ✅ Try during off-peak hours

### Getting Help

**If issue persists:**

1. **Take Screenshot**
   - Press `Print Screen` or `Ctrl+Shift+S`
   - Save error message or issue

2. **Note Details**
   - What were you doing?
   - What did you expect?
   - What actually happened?
   - When did it start?

3. **Contact Support**
   - Email: support@basepan.com
   - Phone: +1 (709) 771-8379
   - Include screenshot and details

---

## Keyboard Shortcuts

Speed up your workflow with keyboard shortcuts.

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Open global search |
| `Ctrl + /` | Show keyboard shortcuts |
| `Esc` | Close modal/dialog |
| `?` | Show help |

### Navigation Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + D` | Go to Dashboard |
| `Alt + V` | Go to Vehicles |
| `Alt + T` | Go to Trips |
| `Alt + M` | Go to Maintenance |
| `Alt + E` | Go to Expenses |
| `Alt + N` | Open Notifications |

### List Page Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + N` | Create new record |
| `Ctrl + F` | Focus search box |
| `/` | Focus search box |
| `Ctrl + R` | Refresh list |

### Form Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + S` | Save form |
| `Ctrl + Enter` | Submit form |
| `Esc` | Cancel/Close |
| `Tab` | Next field |
| `Shift + Tab` | Previous field |

**Note:** On Mac, use `Cmd` instead of `Ctrl`

---

## Glossary

**Terms you'll encounter in VMS:**

**Check-In**  
Recording when a vehicle enters the premises

**Check-Out**  
Recording when a vehicle leaves the premises

**Driver**  
Person authorized to operate a vehicle

**Expense**  
Cost associated with vehicle operation

**Fuel Type**  
Type of fuel used (Petrol, Diesel, Electric, etc.)

**Income**  
Revenue generated from trips or other sources

**Maintenance**  
Scheduled or completed vehicle servicing

**Mileage**  
Total distance traveled by vehicle (in kilometers)

**Plate Number**  
Vehicle license plate/registration number

**Status**  
Current state (Active, Maintenance, Inactive, etc.)

**Trip**  
Journey from one location to another

**Vehicle Owner**  
Person or organization that owns the vehicle

**VIN**  
Vehicle Identification Number (17-character unique code)

**Organization Vehicle**  
Vehicle owned by the company

**Individual Vehicle**  
Vehicle owned by staff, visitor, or vehicle owner

---

## Support

### Contact Information

**Email Support:**  
📧 support@basepan.com

**Phone Support:**  
📞 +1 (709) 771-8379

**Business Hours:**  
🕒 Monday - Friday: 9:00 AM - 5:00 PM EST

**Response Time:**
- Email: Within 24 hours
- Phone: Immediate (during business hours)

### Before Contacting Support

**Please have ready:**
1. Your email address
2. Description of issue
3. Screenshot (if applicable)
4. Steps to reproduce problem
5. Browser and version

### Feature Requests

Have an idea for improvement?

**Submit via:**
- Email: features@basepan.com
- In-app feedback button

**Include:**
- Feature description
- Use case
- Expected benefit

---

## Appendix

### System Limits

**File Uploads:**
- Images: 5MB max
- Documents: 10MB max
- Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX

**Data Limits:**
- Text fields: 255 characters (unless noted)
- Description fields: 1000 characters
- Notes fields: 5000 characters

**List Pagination:**
- Default: 15 items per page
- Options: 15, 30, 50, 100

### Data Retention

**How long data is kept:**
- Active records: Indefinitely
- Deleted records: 90 days (recoverable)
- Archived records: 7 years
- Activity logs: 1 year

### Privacy

**Your data is:**
- ✅ Encrypted in transit (HTTPS)
- ✅ Encrypted at rest
- ✅ Backed up daily
- ✅ Access-controlled by role
- ✅ Never shared with third parties

### Browser Compatibility

**Fully Supported:**
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

**Limited Support:**
- ⚠️ Internet Explorer (not recommended)

---

## Quick Reference Card

**Print this page for easy reference!**

### Most Common Tasks

**Add Vehicle:** Vehicles → Add New Vehicle  
**Add Driver:** Drivers → Add New Driver  
**Check In:** Check-Ins → New Check-In  
**Add Expense:** Expenses → Add Expense  
**Create Trip:** Trips → Create Trip  
**Schedule Maintenance:** Maintenance → Schedule Maintenance  

### Emergency Contacts

**Technical Support:** support@basepan.com  
**Security Issues:** security@basepan.com  
**General Inquiries:** contact@basepan.com  
**Phone:** +1 (709) 771-8379

### Useful Links

**Documentation:** https://docs.basepan.com  
**Video Tutorials:** https://basepan.com/tutorials  
**FAQ:** https://basepan.com/faq  
**System Status:** https://status.basepan.com

---

**Thank you for using VMS!**

We're committed to making fleet management simple and efficient. If you have any questions, suggestions, or feedback, please don't hesitate to contact us.

**Happy Fleet Managing!** 🚗💨

---

*Last Updated: December 21, 2024*  
*Version: 1.0*