<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Content;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;




class ContentController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            "file" => "required|file|max:204800",
            'title' => 'required|string',
            'category' => 'required|string',
            'author' => 'required|string'
        ]);

        $file = $request->file('file');
        $fileName = time() . '_' . preg_replace('/\s+/', '_', $file->getClientOriginalName());
        $fileContent = file_get_contents($file->getRealPath());
        $mimeType = $file->getMimeType();

        $supabaseUrl = env('SUPABASE_URL');
        $supabaseKey = env('SUPABASE_SERVICE_ROLE_KEY');
        $bucket = env('SUPABASE_BUCKET', 'gallery');

        $uploadUrl = "{$supabaseUrl}/storage/v1/object/{$bucket}/{$fileName}";

        $ch = curl_init($uploadUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $fileContent);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$supabaseKey}",
            "Content-Type: {$mimeType}",
            "x-upsert: true",
        ]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 && $httpCode !== 201) {
            return response()->json(['message' => 'Gagal mengunggah ke Supabase Storage', 'detail' => $response], 500);
        }

        $publicUrl = "{$supabaseUrl}/storage/v1/object/public/{$bucket}/{$fileName}";

        Content::create([
            'user_id' => Auth::id(),
            'user_type' => get_class(Auth::user()),
            'title' => $request->title,
            'category' => $request->category,
            'author' => $request->author,
            'file_path' => $publicUrl,
            'status' => 'pending'
        ]);

        return response()->json([
            'message' => 'File uploaded successfully',
            'file' => $publicUrl,
        ]);
    }

    /** Karya milik user yang sedang login (semua status) */
    public function myUploads(Request $request)
    {
        $userId = Auth::id();
        $contents = Content::select('id', 'title', 'category', 'author', 'file_path as image', 'status', 'created_at')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $contents
        ]);
    }
    public function showcase()
    {
        $data = DB::table('contents')
            ->select('id', 'title', 'created_at', 'file_path')
            ->where('status', 'approved')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'status' => 'success',
            'total' => count($data),
            'data' => $data
        ]);
    }
    public function showcaseLimit($limit)
    {
        $data = DB::table('contents')
            ->select('id', 'title', 'created_at', 'file_path')
            ->where('status', 'approved')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'status' => 'success',
            'total' => count($data),
            'data' => $data
        ]);
    }

    public function pending()
    {
        return response()->json(
            Content::where('status', 'pending')->get()
        );
    }
    public function approve($id)
    {
        $content = Content::findOrFail($id);
        $content->status = 'approved';
        $content->save();

        return response()->json(
            ['message' => 'Content approved']
        );
    }

    public function reject($id)
    {
        $content = Content::findOrFail($id);
        $content->status = 'rejected';
        $content->save();

        return response()->json(
            ['message' => 'Content rejected']
        );
    }

    public function destroy($id)
    {
        $content = Content::findOrFail($id);
        $content->delete();

        return response()->json(
            ['message' => 'Content deleted permanently']
        );
    }
}

