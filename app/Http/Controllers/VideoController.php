<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Video;
use Illuminate\Support\Facades\Storage;
use YouTube\YouTubeDownloader;
use YouTube\Exception\YouTubeException;

class VideoController extends Controller
{
    public function index()
    {
        $videos = Video::latest()->get();
        return view('videos.index', compact('videos'));
    }

    public function store(Request $request)
    {
        if ($request->has('is_youtube')) {
            $request->validate([
                'youtube_url' => 'required|url',
                'title' => 'required|string|max:255',
                'thumbnail' => 'nullable|image|max:5000',
                'timing' => 'required|integer|min:1',
            ]);

            // Extract YouTube video ID from URL
            $youtubeUrl = $request->youtube_url;

            // Validate it's a YouTube URL
            if (!preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/', $youtubeUrl, $matches)) {
                return redirect()->back()->withErrors(['youtube_url' => 'Invalid YouTube URL. Please provide a valid YouTube video link.']);
            }

            $thumbnailPath = null;
            if ($request->hasFile('thumbnail')) {
                $thumbnailPath = $request->file('thumbnail')->store('thumbnails', 'public');
            }

            Video::create([
                'title' => $request->title,
                'video_path' => $youtubeUrl, // Store the YouTube URL directly
                'is_youtube' => true,
                'thumbnail_path' => $thumbnailPath,
                'thumbnail_timing' => $request->timing,
            ]);

            return redirect()->route('videos.index')->with('success', 'YouTube video link saved successfully!');
        }

        // Local Upload Logic (Existing)
        $request->validate([
            'videos.*' => 'required|mimes:mp4,mov,avi,wmv|max:20000',
            'thumbnails.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5000',
            'titles.*' => 'required|string|max:255',
            'timings.*' => 'required|integer|min:1',
        ]);

        if ($request->hasFile('videos')) {
            foreach ($request->file('videos') as $index => $videoFile) {
                $videoPath = $videoFile->store('videos', 'public');

                $thumbnailPath = null;
                if ($request->hasFile("thumbnails") && isset($request->file("thumbnails")[$index])) {
                    $thumbnailPath = $request->file("thumbnails")[$index]->store('thumbnails', 'public');
                }

                Video::create([
                    'title' => $request->titles[$index],
                    'video_path' => $videoPath,
                    'is_youtube' => false,
                    'thumbnail_path' => $thumbnailPath,
                    'thumbnail_timing' => $request->timings[$index] ?? 10,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Videos uploaded successfully!');
    }

    public function show($id)
    {
        $video = Video::findOrFail($id);
        return view('videos.player', compact('video'));
    }
}
