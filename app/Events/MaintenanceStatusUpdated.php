<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Maintenance;

class MaintenanceStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $maintenance;

    public function __construct(Maintenance $maintenance)
    {
        $this->maintenance = $maintenance->load('vehicle');
    }

    public function broadcastOn()
    {
        return new Channel('maintenance-updates');
    }

    public function broadcastAs()
    {
        return 'maintenance.status-updated';
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->maintenance->id,
            'vehicle_plate' => $this->maintenance->vehicle->plate_number,
            'status' => $this->maintenance->status,
            'description' => $this->maintenance->description,
        ];
    }
}