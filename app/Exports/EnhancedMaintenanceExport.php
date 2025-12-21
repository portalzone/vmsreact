<?php

namespace App\Exports;

use App\Models\Maintenance;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use Carbon\Carbon;

class EnhancedMaintenanceExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle, ShouldAutoSize
{
    protected $startDate;
    protected $endDate;

    public function __construct($startDate, $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        return Maintenance::with(['vehicle', 'createdBy'])
            ->whereBetween('date', [$this->startDate, $this->endDate])
            ->orderBy('date', 'desc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Date',
            'Vehicle',
            'Plate Number',
            'Description',
            'Status',
            'Cost (₦)',
            'Created By',
            'Created At',
        ];
    }

    public function map($maintenance): array
    {
        return [
            $maintenance->id,
            Carbon::parse($maintenance->date)->format('Y-m-d'),
            $maintenance->vehicle ? "{$maintenance->vehicle->manufacturer} {$maintenance->vehicle->model}" : 'N/A',
            $maintenance->vehicle ? $maintenance->vehicle->plate_number : 'N/A',
            $maintenance->description,
            $maintenance->status === 'in_progress' ? 'In Progress' : ucfirst($maintenance->status),
            $maintenance->cost ? number_format($maintenance->cost, 2) : '0.00',
            $maintenance->createdBy ? $maintenance->createdBy->name : 'N/A',
            Carbon::parse($maintenance->created_at)->format('Y-m-d H:i:s'),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'F59E0B'],
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ],
            ],
        ];
    }

    public function title(): string
    {
        return 'Maintenance';
    }
}