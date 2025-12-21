<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Maintenance Report</title>
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
            border-bottom: 3px solid #f59e0b;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #f59e0b;
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
            background-color: #f59e0b;
            color: white;
            padding: 10px;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .summary-box {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin-bottom: 25px;
        }
        .summary-box h3 {
            margin: 0 0 15px 0;
            color: #92400e;
        }
        .summary-grid {
            display: table;
            width: 100%;
        }
        .summary-item {
            display: table-row;
        }
        .summary-label {
            display: table-cell;
            font-weight: bold;
            padding: 8px 0;
            width: 60%;
        }
        .summary-value {
            display: table-cell;
            text-align: right;
            padding: 8px 0;
            font-size: 14px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th {
            background-color: #f59e0b;
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
        .badge-blue { background-color: #dbeafe; color: #1e40af; }
        .total-row {
            font-weight: bold;
            background-color: #fef3c7 !important;
            font-size: 14px;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>Maintenance Report</h1>
        <p><strong>Period: {{ \Carbon\Carbon::parse($startDate)->format('M d, Y') }} - {{ \Carbon\Carbon::parse($endDate)->format('M d, Y') }}</strong></p>
        <p>Generated: {{ now()->format('F d, Y - h:i A') }}</p>
    </div>

    <!-- Summary -->
    <div class="summary-box">
        <h3>Summary</h3>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Total Maintenance Records:</div>
                <div class="summary-value">{{ $maintenances->count() }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Cost (Completed):</div>
                <div class="summary-value">₦{{ number_format($totalCost, 2) }}</div>
            </div>
        </div>

        @if($byStatus->count() > 0)
        <h3 style="margin-top: 20px;">By Status</h3>
        <div class="summary-grid">
            @foreach($byStatus as $status => $count)
            <div class="summary-item">
                <div class="summary-label">{{ $status === 'in_progress' ? 'In Progress' : ucfirst($status) }}:</div>
                <div class="summary-value">{{ $count }} ({{ number_format(($count / $maintenances->count()) * 100, 1) }}%)</div>
            </div>
            @endforeach
        </div>
        @endif
    </div>

    <!-- Detailed Maintenance -->
    <div class="section">
        <div class="section-title">Detailed Maintenance Records</div>
        
        @if($maintenances->count() > 0)
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Vehicle</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th style="text-align: right;">Cost</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($maintenances as $maintenance)
                    <tr>
                        <td>{{ \Carbon\Carbon::parse($maintenance->date)->format('M d, Y') }}</td>
                        <td>{{ $maintenance->vehicle ? $maintenance->vehicle->plate_number : 'N/A' }}</td>
                        <td>{{ Str::limit($maintenance->description, 50) }}</td>
                        <td>
                            <span class="badge badge-{{ $maintenance->status === 'Completed' ? 'green' : ($maintenance->status === 'in_progress' ? 'blue' : 'yellow') }}">
                                {{ $maintenance->status === 'in_progress' ? 'IN PROGRESS' : strtoupper($maintenance->status) }}
                            </span>
                        </td>
                        <td style="text-align: right;">{{ $maintenance->cost ? '₦' . number_format($maintenance->cost, 2) : '-' }}</td>
                    </tr>
                    @endforeach
                    <tr class="total-row">
                        <td colspan="4" style="text-align: right; padding-right: 15px;">TOTAL COST (Completed):</td>
                        <td style="text-align: right;">₦{{ number_format($totalCost, 2) }}</td>
                    </tr>
                </tbody>
            </table>
        @else
            <p>No maintenance records found for the selected period.</p>
        @endif
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>This is a computer-generated report from the Vehicle Management System</p>
        <p>© {{ now()->year }} VMS - All Rights Reserved</p>
    </div>
</body>
</html>