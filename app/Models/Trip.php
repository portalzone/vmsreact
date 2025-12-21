<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use App\Traits\Searchable;

class Trip extends Model
{
    use HasFactory, LogsActivity, Searchable;

    protected $fillable = [
        'driver_id',
        'vehicle_id',
        'start_location',
        'end_location',
        'start_time',
        'end_time',
        'status',
        'distance',
        'purpose',
        'amount',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'distance' => 'decimal:2',
        'amount' => 'decimal:2',
    ];

    /**
     * Spatie activity log settings
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->useLogName('trip')
            ->logOnlyDirty();
    }

    /**
     * Get searchable columns for this model
     */
    public static function getSearchableColumns(): array
    {
        return [
            'start_location',
            'end_location',
            'purpose',
            'vehicle.plate_number',
            'vehicle.manufacturer',
            'vehicle.model',
            'driver.user.name',
        ];
    }

    /**
     * Scope for advanced trip filtering
     */
    public function scopeFilter(Builder $query, array $filters)
    {
        return $query
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->search($search, self::getSearchableColumns());
            })
            ->when($filters['status'] ?? null, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($filters['vehicle_id'] ?? null, function ($query, $vehicleId) {
                $query->where('vehicle_id', $vehicleId);
            })
            ->when($filters['driver_id'] ?? null, function ($query, $driverId) {
                $query->where('driver_id', $driverId);
            })
            ->when($filters['start_date'] ?? null, function ($query, $date) {
                $query->whereDate('start_time', '>=', $date);
            })
            ->when($filters['end_date'] ?? null, function ($query, $date) {
                $query->whereDate('start_time', '<=', $date);
            })
            ->when($filters['min_distance'] ?? null, function ($query, $distance) {
                $query->where('distance', '>=', $distance);
            })
            ->when($filters['max_distance'] ?? null, function ($query, $distance) {
                $query->where('distance', '<=', $distance);
            });
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function income()
    {
        return $this->hasOne(Income::class);
    }
}