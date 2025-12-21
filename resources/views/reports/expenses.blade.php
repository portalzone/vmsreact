<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Expense Report</title>
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
            border-bottom: 3px solid #dc2626;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #dc2626;
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
            background-color: #dc2626;
            color: white;
            padding: 10px;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .summary-box {
            background-color: #fee2e2;
            border-left: 4px solid #dc2626;
            padding: 20px;
            margin-bottom: 25px;
        }
        .summary-box h3 {
            margin: 0 0 15px 0;
            color: #991b1b;
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
            background-color: #dc2626;
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
            background-color: #fee2e2 !important;
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
        <h1>Expense Report</h1>
        <p><strong>Period: {{ \Carbon\Carbon::parse($startDate)->format('M d, Y') }} - {{ \Carbon\Carbon::parse($endDate)->format('M d, Y') }}</strong></p>
        <p>Generated: {{ now()->format('F d, Y - h:i A') }}</p>
    </div>

    <!-- Summary -->
    <div class="summary-box">
        <h3>Summary</h3>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Total Expenses:</div>
                <div class="summary-value">₦{{ number_format($totalAmount, 2) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Number of Transactions:</div>
                <div class="summary-value">{{ $expenses->count() }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Average per Transaction:</div>
                <div class="summary-value">₦{{ $expenses->count() > 0 ? number_format($totalAmount / $expenses->count(), 2) : '0.00' }}</div>
            </div>
        </div>

        @if($byCategory->count() > 0)
        <h3 style="margin-top: 20px;">By Category</h3>
        <div class="summary-grid">
            @foreach($byCategory as $category => $amount)
            <div class="summary-item">
                <div class="summary-label">{{ ucfirst($category) }}:</div>
                <div class="summary-value">₦{{ number_format($amount, 2) }} ({{ number_format(($amount / $totalAmount) * 100, 1) }}%)</div>
            </div>
            @endforeach
        </div>
        @endif
    </div>

    <!-- Detailed Expenses -->
    <div class="section">
        <div class="section-title">Detailed Expenses</div>
        
        @if($expenses->count() > 0)
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Vehicle</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($expenses as $expense)
                    <tr>
                        <td>{{ \Carbon\Carbon::parse($expense->date)->format('M d, Y') }}</td>
                        <td>{{ $expense->vehicle ? $expense->vehicle->plate_number : 'N/A' }}</td>
                        <td>{{ Str::limit($expense->description, 50) }}</td>
                        <td>{{ ucfirst($expense->category) }}</td>
                        <td style="text-align: right;">₦{{ number_format($expense->amount, 2) }}</td>
                    </tr>
                    @endforeach
                    <tr class="total-row">
                        <td colspan="4" style="text-align: right; padding-right: 15px;">TOTAL:</td>
                        <td style="text-align: right;">₦{{ number_format($totalAmount, 2) }}</td>
                    </tr>
                </tbody>
            </table>
        @else
            <p>No expenses found for the selected period.</p>
        @endif
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>This is a computer-generated report from the Vehicle Management System</p>
        <p>© {{ now()->year }} VMS - All Rights Reserved</p>
    </div>
</body>
</html>