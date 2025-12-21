<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;

trait HandlesImageUpload
{
    /**
     * Upload an image and return the path
     */
    public function uploadImage(UploadedFile $file, string $directory = 'uploads', array $options = []): string
    {
        // Generate unique filename
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        
        // Default options
        $maxWidth = $options['max_width'] ?? 1920;
        $maxHeight = $options['max_height'] ?? 1080;
        $quality = $options['quality'] ?? 85;
        
        // Store original or resized image
        if (isset($options['resize']) && $options['resize']) {
            // Resize image
            $image = Image::make($file)
                ->resize($maxWidth, $maxHeight, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });
            
            // Save to storage
            $path = "{$directory}/{$filename}";
            Storage::disk('public')->put($path, (string) $image->encode(null, $quality));
        } else {
            // Store original
            $path = $file->storeAs($directory, $filename, 'public');
        }
        
        return $path;
    }
    
    /**
     * Delete an image
     */
    public function deleteImage(?string $path): bool
    {
        if ($path && Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }
        
        return false;
    }
    
    /**
     * Get full URL for an image
     */
    public function getImageUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }
        
        return Storage::disk('public')->url($path);
    }
}