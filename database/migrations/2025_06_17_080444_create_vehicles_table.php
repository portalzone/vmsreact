<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('owner_id')->nullable();

            $table->string('plate_number')->unique();
            $table->string('model');
            $table->string('manufacturer');
            $table->integer('year');
            
            // Additional vehicle details
            $table->string('color')->nullable();
            $table->string('vin', 17)->nullable()->unique();
            $table->enum('status', ['active', 'maintenance', 'inactive', 'sold'])->default('active');
            $table->enum('fuel_type', ['petrol', 'diesel', 'electric', 'hybrid', 'cng', 'lpg'])->nullable();
            $table->integer('seating_capacity')->nullable();
            $table->decimal('mileage', 10, 2)->nullable();
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_price', 15, 2)->nullable();
            $table->text('notes')->nullable();

            // Main ownership type
            $table->enum('ownership_type', ['organization', 'individual'])->default('organization');

            // Subtype for individuals (nullable for organization type)
            $table->enum('individual_type', ['staff', 'visitor', 'vehicle_owner'])->nullable();

            $table->timestamps();

            // Foreign key constraints
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('updated_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('owner_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};