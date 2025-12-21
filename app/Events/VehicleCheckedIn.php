<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\CheckInOut;

class VehicleCheckedIn implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $checkIn;

    public function __construct(CheckInOut $checkIn)
    {
        $this->checkIn = $checkIn->load(['vehicle', 'driver.user']);
    }

    public function broadcastOn()
    {
        return new Channel('vehicle-tracking');
    }

    public function broadcastAs()
    {
        return 'vehicle.checked-in';
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->checkIn->id,
            'vehicle' => [
                'id' => $this->checkIn->vehicle->id,
                'plate_number' => $this->checkIn->vehicle->plate_number,
                'manufacturer' => $this->checkIn->vehicle->manufacturer,
                'model' => $this->checkIn->vehicle->model,
            ],
            'driver' => [
                'name' => $this->checkIn->driver->user->name ?? 'Unknown',
            ],
            'checked_in_at' => $this->checkIn->checked_in_at,
            'purpose' => $this->checkIn->purpose,
        ];
    }
}