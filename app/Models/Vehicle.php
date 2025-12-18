<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Vehicle extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'manufacturer',
        'model',
        'year',
        'plate_number',
        'ownership_type',
        'individual_type',
        'owner_id',
        'created_by',
        'updated_by',
        'color',
    'vin',
    'status',
    'fuel_type',
    'seating_capacity',
    'mileage',
    'purchase_date',
    'purchase_price',
    'notes',
    ];

    /**
     * Spatie activity log settings
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->useLogName('vehicle')
            ->logOnlyDirty();
    }

    /**
     * Belongs to vehicle owner (User with role 'vehicle_owner')
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }


    /**
     * Creator and editor (Admins/Managers)
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function editor()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * A vehicle has many drivers over time
     */
    
public function driver()
{
    return $this->hasOne(Driver::class); // Current assigned driver
}

    // public function drivers()
    // {
    //     return $this->hasMany(Driver::class);
    // }


    /**
     * Vehicle has many trips
     */
    public function trips()
    {
        return $this->hasMany(Trip::class);
    }

    /**
     * Vehicle check-in/out logs
     */
    public function checkins()
    {
        return $this->hasMany(CheckInOut::class);
    }

    /**
     * Vehicle expenses
     */
    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    /**
     * Maintenance records
     */
    public function maintenances()
    {
        return $this->hasMany(Maintenance::class);
    }

    public function maintenanceRecords()
{
    return $this->hasMany(Maintenance::class);
}

}
