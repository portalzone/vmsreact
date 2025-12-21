<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use App\Traits\HandlesImageUpload;
use Illuminate\Support\Facades\Storage;
use App\Traits\Searchable;

class Vehicle extends Model
{
    use HasFactory, HandlesImageUpload, Searchable;

    protected $fillable = [
        'plate_number',
        'manufacturer',
        'model',
        'year',
        'color',
        'vin',
        'status',
        'mileage',
        'fuel_type',
        'seating_capacity',
        'purchase_date',
        'purchase_price',
        'notes',
        'ownership_type',
        'individual_type',
        'owner_id',
        'driver_id',
        'primary_photo',
        'photos',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'photos' => 'array',
        'mileage' => 'decimal:2',
        'year' => 'integer',
        'purchase_price' => 'decimal:2',
        'purchase_date' => 'date:Y-m-d', // ✅ Format as yyyy-MM-dd
    ];

    /**
     * Get searchable columns for this model
     */
    public static function getSearchableColumns(): array
    {
        return [
            'plate_number',
            'manufacturer',
            'model',
            'vin',
            'color',
            'owner.name',
            'owner.email',
            'driver.user.name',
        ];
    }

    /**
     * Scope for advanced vehicle filtering
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
            ->when($filters['ownership_type'] ?? null, function ($query, $type) {
                $query->where('ownership_type', $type);
            })
            ->when($filters['individual_type'] ?? null, function ($query, $type) {
                $query->where('individual_type', $type);
            })
            ->when($filters['fuel_type'] ?? null, function ($query, $type) {
                $query->where('fuel_type', $type);
            })
            ->when($filters['year_from'] ?? null, function ($query, $year) {
                $query->where('year', '>=', $year);
            })
            ->when($filters['year_to'] ?? null, function ($query, $year) {
                $query->where('year', '<=', $year);
            })
            ->when($filters['manufacturer'] ?? null, function ($query, $manufacturer) {
                $query->where('manufacturer', 'LIKE', "%{$manufacturer}%");
            })
            ->when($filters['driver_id'] ?? null, function ($query, $driverId) {
                $query->whereHas('driver', function ($q) use ($driverId) {
                    $q->where('id', $driverId);
                });
            })
            ->when($filters['owner_id'] ?? null, function ($query, $ownerId) {
                $query->where('owner_id', $ownerId);
            });
    }

    // Relationships
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function trips()
    {
        return $this->hasMany(Trip::class);
    }

    public function maintenances()
    {
        return $this->hasMany(Maintenance::class);
    }

    public function checkIns()
    {
        return $this->hasMany(CheckInOut::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function editor()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Accessors for image URLs
    public function getPrimaryPhotoUrlAttribute()
    {
        return $this->getImageUrl($this->primary_photo);
    }

    public function getPhotosUrlsAttribute()
    {
        if (!$this->photos || !is_array($this->photos)) {
            return [];
        }

        return array_map(function ($photo) {
            return $this->getImageUrl($photo);
        }, $this->photos);
    }
}