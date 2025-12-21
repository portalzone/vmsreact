<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Vehicle Report - {{ $vehicle->plate_number }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            background-color: #2563eb;
            color: white;
            padding: 10px;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 15px;
        }
        .info-row {
            display: table-row;
        }
        .info-label {
            display: table-cell;
            font-weight: bold;
            padding: 8px;
            width: 35%;
            background-color: #f3f4f6;
        }
        .info-value {
            display: table-cell;
            padding: 8px;
            border-bottom: 1px solid #e5e7eb;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th {
            background-color: #2563eb;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: bold;
        }
        td {
            padding: 8px;
            border-bottom: 1px solid #e5e7eb;
        }
        tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
        }
        .badge-green { background-color: #dcfce7; color: #166534; }
        .badge-yellow { background-color: #fef3c7; color: #92400e; }
        .badge-red { background-color: #fee2e2; color: #991b1b; }
        .badge-blue { background-color: #dbeafe; color: #1e40af; }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
        }
        .summary-box {
            background-color: #f3f4f6;
            padding: 15px;
            border-left: 4px solid #2563eb;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>Vehicle Report</h1>
        <p><strong>{{ $vehicle->manufacturer }} {{ $vehicle->model }} ({{ $vehicle->year }})</strong></p>
        <p>Plate Number: <strong>{{ $vehicle->plate_number }}</strong></p>
        <p>Generated: {{ now()->format('F d, Y - h:i A') }}</p>
    </div>

    <!-- Basic Information -->
    <div class="section">
        <div class="section-title">Basic Information</div>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Plate Number</div>
                <div class="info-value">{{ $vehicle->plate_number }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Manufacturer</div>
                <div class="info-value">{{ $vehicle->manufacturer }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Model</div>
                <div class="info-value">{{ $vehicle->model }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Year</div>
                <div class="info-value">{{ $vehicle->year }}</div>
            </div>
            @if($vehicle->color)
            <div class="info-row">
                <div class="info-label">Color</div>
                <div class="info-value">{{ $vehicle->color }}</div>
            </div>
            @endif
            @if($vehicle->vin)
            <div class="info-row">
                <div class="info-label">VIN</div>
                <div class="info-value">{{ $vehicle->vin }}</div>
            </div>
            @endif
            <div class="info-row">
                <div class="info-label">Status</div>
                <div class="info-value">
                    <span class="badge badge-{{ $vehicle->status === 'active' ? 'green' : ($vehicle->status === 'maintenance' ? 'yellow' : 'red') }}">
                        {{ strtoupper($vehicle->status) }}
                    </span>
                </div>
            </div>
        </div>
    </div>

    <!-- Specifications -->
    @if($vehicle->fuel_type || $vehicle->seating_capacity || $vehicle->mileage)
    <div class="section">
        <div class="section-title">Specifications</div>
        <div class="info-grid">
            @if($vehicle->fuel_type)
            <div class="info-row">
                <div class="info-label">Fuel Type</div>
                <div class="info-value">{{ ucfirst($vehicle->fuel_type) }}</div>
            </div>
            @endif
            @if($vehicle->seating_capacity)
            <div class="info-row">
                <div class="info-label">Seating Capacity</div>
                <div class="info-value">{{ $vehicle->seating_capacity }} seats</div>
            </div>
            @endif
            @if($vehicle->mileage)
            <div class="info-row">
                <div class="info-label">Current Mileage</div>
                <div class="info-value">{{ number_format($vehicle->mileage, 2) }} km</div>
            </div>
            @endif
        </div>
    </div>
    @endif

    <!-- Ownership Information -->
    <div class="section">
        <div class="section-title">Ownership Information</div>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Ownership Type</div>
                <div class="info-value">{{ ucfirst($vehicle->ownership_type) }}</div>
            </div>
            @if($vehicle->individual_type)
            <div class="info-row">
                <div class="info-label">Individual Type</div>
                <div class="info-value">{{ ucfirst(str_replace('_', ' ', $vehicle->individual_type)) }}</div>
            </div>
            @endif
            @if($vehicle->owner)
            <div class="info-row">
                <div class="info-label">Owner</div>
                <div class="info-value">{{ $vehicle->owner->name }} ({{ $vehicle->owner->email }})</div>
            </div>
            @endif
        </div>
    </div>

    <!-- Maintenance History -->
    <div class="section">
        <div class="section-title">Maintenance History ({{ $maintenances->count() }} records)</div>
        
        @if($maintenances->count() > 0)
            <div class="summary-box">
                <strong>Summary:</strong>
                Completed: {{ $maintenances->where('status', 'Completed')->count() }} | 
                In Progress: {{ $maintenances->where('status', 'in_progress')->count() }} | 
                Pending: {{ $maintenances->where('status', 'Pending')->count() }} | 
                Total Cost: ₦{{ number_format($maintenances->where('status', 'Completed')->sum('cost'), 2) }}
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Cost</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($maintenances as $maintenance)
                    <tr>
                        <td>{{ \Carbon\Carbon::parse($maintenance->date)->format('M d, Y') }}</td>
                        <td>{{ Str::limit($maintenance->description, 50) }}</td>
                        <td>
                            <span class="badge badge-{{ $maintenance->status === 'Completed' ? 'green' : ($maintenance->status === 'in_progress' ? 'blue' : 'yellow') }}">
                                {{ $maintenance->status === 'in_progress' ? 'IN PROGRESS' : strtoupper($maintenance->status) }}
                            </span>
                        </td>
                        <td>{{ $maintenance->cost ? '₦' . number_format($maintenance->cost, 2) : '-' }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p>No maintenance records found.</p>
        @endif
    </div>

    <!-- Expense History -->
    <div class="section">
        <div class="section-title">Expense History ({{ $expenses->count() }} records)</div>
        
        @if($expenses->count() > 0)
            <div class="summary-box">
                <strong>Total Expenses:</strong> ₦{{ number_format($expenses->sum('amount'), 2) }}
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($expenses as $expense)
                    <tr>
                        <td>{{ \Carbon\Carbon::parse($expense->date)->format('M d, Y') }}</td>
                        <td>{{ Str::limit($expense->description, 40) }}</td>
                        <td>{{ ucfirst($expense->category) }}</td>
                        <td>₦{{ number_format($expense->amount, 2) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p>No expense records found.</p>
        @endif
    </div>

    <!-- Recent Trips -->
    <div class="section">
        <div class="section-title">Recent Trips (Last 20)</div>
        
        @if($trips->count() > 0)
            <div class="summary-box">
                <strong>Total Distance:</strong> {{ number_format($trips->sum('distance'), 2) }} km
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Driver</th>
                        <th>Purpose</th>
                        <th>Distance (km)</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($trips as $trip)
                    <tr>
                        <td>{{ \Carbon\Carbon::parse($trip->start_time)->format('M d, Y') }}</td>
                        <td>{{ $trip->driver->user->name ?? 'N/A' }}</td>
                        <td>{{ Str::limit($trip->purpose, 30) }}</td>
                        <td>{{ $trip->distance ? number_format($trip->distance, 2) : '-' }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p>No trip records found.</p>
        @endif
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>This is a computer-generated report from the Vehicle Management System</p>
        <p>© {{ now()->year }} VMS - All Rights Reserved</p>
    </div>
</body>
</html>