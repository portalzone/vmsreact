<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\CheckInOut;

class VehicleCheckedOut implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $checkOut;

    public function __construct(CheckInOut $checkOut)
    {
        $this->checkOut = $checkOut->load(['vehicle', 'driver.user']);
    }

    public function broadcastOn()
    {
        return new Channel('vehicle-tracking');
    }

    public function broadcastAs()
    {
        return 'vehicle.checked-out';
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->checkOut->id,
            'vehicle' => [
                'id' => $this->checkOut->vehicle->id,
                'plate_number' => $this->checkOut->vehicle->plate_number,
            ],
            'checked_out_at' => $this->checkOut->checked_out_at,
        ];
    }
}