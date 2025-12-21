<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Income Report</title>
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
            border-bottom: 3px solid #10b981;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #10b981;
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
            background-color: #10b981;
            color: white;
            padding: 10px;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .summary-box {
            background-color: #d1fae5;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin-bottom: 25px;
        }
        .summary-box h3 {
            margin: 0 0 15px 0;
            color: #065f46;
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
            background-color: #10b981;
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
        .total-row {
            font-weight: bold;
            background-color: #d1fae5 !important;
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
        <h1>Income Report</h1>
        <p><strong>Period: {{ \Carbon\Carbon::parse($startDate)->format('M d, Y') }} - {{ \Carbon\Carbon::parse($endDate)->format('M d, Y') }}</strong></p>
        <p>Generated: {{ now()->format('F d, Y - h:i A') }}</p>
    </div>

    <!-- Summary -->
    <div class="summary-box">
        <h3>Summary</h3>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Total Income:</div>
                <div class="summary-value">₦{{ number_format($totalAmount, 2) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Number of Transactions:</div>
                <div class="summary-value">{{ $incomes->count() }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Average per Transaction:</div>
                <div class="summary-value">₦{{ $incomes->count() > 0 ? number_format($totalAmount / $incomes->count(), 2) : '0.00' }}</div>
            </div>
        </div>
    </div>

    <!-- Detailed Income -->
    <div class="section">
        <div class="section-title">Detailed Income Records</div>
        
        @if($incomes->count() > 0)
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Vehicle</th>
                        <th>Driver</th>
                        <th>Trip/Description</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($incomes as $income)
                    <tr>
                        <td>{{ \Carbon\Carbon::parse($income->date)->format('M d, Y') }}</td>
                        <td>{{ $income->vehicle ? $income->vehicle->plate_number : 'N/A' }}</td>
                        <td>{{ $income->driver?->user?->name ?? 'N/A' }}</td>
                        <td>
                            @if($income->trip)
                                {{ Str::limit($income->trip->start_location . ' → ' . $income->trip->end_location, 40) }}
                            @else
                                {{ Str::limit($income->description, 40) }}
                            @endif
                        </td>
                        <td style="text-align: right;">₦{{ number_format($income->amount, 2) }}</td>
                    </tr>
                    @endforeach
                    <tr class="total-row">
                        <td colspan="4" style="text-align: right; padding-right: 15px;">TOTAL:</td>
                        <td style="text-align: right;">₦{{ number_format($totalAmount, 2) }}</td>
                    </tr>
                </tbody>
            </table>
        @else
            <p>No income records found for the selected period.</p>
        @endif
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>This is a computer-generated report from the Vehicle Management System</p>
        <p>© {{ now()->year }} VMS - All Rights Reserved</p>
    </div>
</body>
</html>