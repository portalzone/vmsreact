<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use App\Traits\Searchable;

class Driver extends Model
{
    use HasFactory, LogsActivity, Searchable;

    protected $fillable = [
        'user_id',
        'vehicle_id',
        'license_number',
        'phone_number',
        'home_address',
        'sex',
        'created_by',
        'updated_by',
        'driver_type',
    ];

    /**
     * Spatie activity log settings
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->useLogName('driver')
            ->logOnlyDirty();
    }

    /**
     * Get searchable columns for this model
     */
    public static function getSearchableColumns(): array
    {
        return [
            'license_number',
            'phone_number',
            'home_address',
            'user.name',
            'user.email',
            'vehicle.plate_number',
            'vehicle.manufacturer',
            'vehicle.model',
        ];
    }

    /**
     * Scope for advanced driver filtering
     */
    public function scopeFilter(Builder $query, array $filters)
    {
        return $query
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->search($search, self::getSearchableColumns());
            })
            ->when($filters['vehicle_id'] ?? null, function ($query, $vehicleId) {
                $query->where('vehicle_id', $vehicleId);
            })
            ->when($filters['driver_type'] ?? null, function ($query, $type) {
                $query->where('driver_type', $type);
            })
            ->when($filters['sex'] ?? null, function ($query, $sex) {
                $query->where('sex', $sex);
            })
            ->when($filters['has_vehicle'] ?? null, function ($query, $hasVehicle) {
                if ($hasVehicle === 'true' || $hasVehicle === true || $hasVehicle === '1') {
                    $query->whereNotNull('vehicle_id');
                } else if ($hasVehicle === 'false' || $hasVehicle === false || $hasVehicle === '0') {
                    $query->whereNull('vehicle_id');
                }
            });
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function trips()
    {
        return $this->hasMany(Trip::class, 'driver_id', 'id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function editor()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}