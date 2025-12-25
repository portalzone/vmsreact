<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
{
Schema::create('expenses', function (Blueprint $table) {
    $table->id();
    $table->foreignId('vehicle_id')->constrained('vehicles')->onDelete('cascade');
    $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
    $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
    // Optional link to a maintenance record (nullable)
    $table->foreignId('maintenance_id')->nullable()->constrained('maintenances')->onDelete('set null');
    $table->string('category')->nullable()->after('amount');
    $table->string('description');
    $table->decimal('amount', 10, 2);
    $table->date('date');
    $table->timestamps();
});


    
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
