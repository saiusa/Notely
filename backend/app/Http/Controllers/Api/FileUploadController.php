<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileUploadController extends Controller
{
    /**
     * Upload a file (image, document, etc.)
     * POST /api/uploads
     */
    public function upload(Request $request): JsonResponse
    {
        \Log::info('Upload request received', [
            'has_file' => $request->hasFile('file'),
            'files' => $request->files->keys(),
            'all_input' => array_keys($request->all()),
        ]);

        $validated = $request->validate([
            'file' => ['required', 'file', 'image', 'max:5120'], // max 5MB
        ]);

        $file = $validated['file'];
        
        // Generate unique filename
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        
        // Store file in public/storage/uploads directory
        $path = $file->storeAs('uploads', $filename, 'public');
        
        // Return the public URL
        $fileUrl = '/storage/' . $path;

        \Log::info('File uploaded successfully', [
            'filename' => $filename,
            'path' => $path,
            'url' => $fileUrl,
        ]);

        return response()->json([
            'success' => true,
            'url' => $fileUrl,
            'filename' => $filename,
            'path' => $path,
        ], 201);
    }
}
