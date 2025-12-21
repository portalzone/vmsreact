<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use App\Traits\Searchable;

class Expense extends Model
{
    use HasFactory, LogsActivity, Searchable;

    protected $fillable = [
        'vehicle_id',
        'amount',
        'description',
        'category',
        'date',
        'maintenance_id',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    /**
     * Spatie activity log settings
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->useLogName('expense')
            ->logOnlyDirty();
    }

    /**
     * Get searchable columns for this model
     */
    public static function getSearchableColumns(): array
    {
        return [
            'description',
            'category',
            'vehicle.plate_number',
            'vehicle.manufacturer',
            'vehicle.model',
            'creator.name',
        ];
    }

    /**
     * Scope for advanced expense filtering
     */
    public function scopeFilter(Builder $query, array $filters)
    {
        return $query
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->search($search, self::getSearchableColumns());
            })
            ->when($filters['category'] ?? null, function ($query, $category) {
                $query->where('category', $category);
            })
            ->when($filters['vehicle_id'] ?? null, function ($query, $vehicleId) {
                $query->where('vehicle_id', $vehicleId);
            })
            ->when($filters['start_date'] ?? null, function ($query, $date) {
                $query->whereDate('date', '>=', $date);
            })
            ->when($filters['end_date'] ?? null, function ($query, $date) {
                $query->whereDate('date', '<=', $date);
            })
            ->when($filters['min_amount'] ?? null, function ($query, $amount) {
                $query->where('amount', '>=', $amount);
            })
            ->when($filters['max_amount'] ?? null, function ($query, $amount) {
                $query->where('amount', '<=', $amount);
            });
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function maintenance()
    {
        return $this->belongsTo(Maintenance::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}