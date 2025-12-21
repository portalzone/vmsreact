<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use App\Traits\Searchable;
use App\Traits\HandlesImageUpload;

class Maintenance extends Model
{
    use HasFactory, LogsActivity, HandlesImageUpload, Searchable;

    protected $fillable = [
        'vehicle_id',
        'description',
        'status',
        'cost',
        'date',
        'notes',
        'attachments',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'date' => 'date',
        'cost' => 'float',
        'attachments' => 'array',
    ];

    /**
     * Spatie activity log settings
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->useLogName('maintenance')
            ->logOnlyDirty();
    }

    /**
     * Get searchable columns for this model
     */
    public static function getSearchableColumns(): array
    {
        return [
            'description',
            'notes',
            'vehicle.plate_number',
            'vehicle.manufacturer',
            'vehicle.model',
            'createdBy.name',
        ];
    }

    /**
     * Scope for advanced maintenance filtering
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
            ->when($filters['start_date'] ?? null, function ($query, $date) {
                $query->whereDate('date', '>=', $date);
            })
            ->when($filters['end_date'] ?? null, function ($query, $date) {
                $query->whereDate('date', '<=', $date);
            })
            ->when($filters['min_cost'] ?? null, function ($query, $cost) {
                $query->where('cost', '>=', $cost);
            })
            ->when($filters['max_cost'] ?? null, function ($query, $cost) {
                $query->where('cost', '<=', $cost);
            });
    }

    /**
     * Accessor for attachment URLs
     */
    public function getAttachmentsUrlsAttribute()
    {
        if (!$this->attachments || !is_array($this->attachments)) {
            return [];
        }

        return array_map(function ($attachment) {
            return [
                'name' => $attachment['name'] ?? 'document',
                'url' => $this->getImageUrl($attachment['path'] ?? null),
                'type' => $attachment['type'] ?? 'application/pdf',
                'size' => $attachment['size'] ?? null,
            ];
        }, $this->attachments);
    }

    /**
     * Relationship: Maintenance belongs to a vehicle
     */
    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Relationship: Maintenance has one expense (legacy)
     */
    public function expense()
    {
        return $this->hasOne(Expense::class);
    }

    /**
     * Relationship: Maintenance can have multiple expenses
     */
    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    /**
     * Relationship: User who created this maintenance record
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relationship: User who last updated this maintenance record
     */
    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}