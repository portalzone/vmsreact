<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use App\Traits\HandlesImageUpload;
use App\Notifications\ResetPasswordNotification;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, LogsActivity, HandlesImageUpload;

    /**
     * The guard name for Spatie permission.
     */
    protected $guard_name = 'api';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'phone',
        'login_count',
        'last_login_at',
    ];

    protected $with = ['roles'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'last_login_at' => 'datetime',
    ];

    /**
     * Spatie activity log settings
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->useLogName('user')
            ->logOnlyDirty();
    }

    /**
     * Send password reset notification
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    /**
     * Accessor for avatar URL
     */
    public function getAvatarUrlAttribute()
    {
        return $this->getImageUrl($this->avatar);
    }

    /**
     * Relationship: A user can have one driver profile
     */
    public function driver()
    {
        return $this->hasOne(Driver::class);
    }

    /**
     * Relationship: A user can own multiple vehicles
     */
    public function ownedVehicles()
    {
        return $this->hasMany(Vehicle::class, 'owner_id');
    }

    /**
     * Relationship: Vehicles created by this user
     */
    public function createdVehicles()
    {
        return $this->hasMany(Vehicle::class, 'created_by');
    }

    /**
     * Relationship: Drivers created by this user
     */
    public function createdDrivers()
    {
        return $this->hasMany(Driver::class, 'created_by');
    }

    /**
     * Relationship: Maintenance records created by this user
     */
    public function createdMaintenances()
    {
        return $this->hasMany(Maintenance::class, 'created_by');
    }

    /**
     * Relationship: Expenses created by this user
     */
    public function createdExpenses()
    {
        return $this->hasMany(Expense::class, 'created_by');
    }
}