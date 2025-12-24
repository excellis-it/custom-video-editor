<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Video;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use YouTube\YouTubeDownloader;
use YouTube\Exception\YouTubeException;
use GuzzleHttp\Client;

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
                // 'timing' => 'required|integer|min:1',
            ]);

            // Extract YouTube video ID from URL
            $youtubeUrl = $request->youtube_url;

            // Validate it's a YouTube URL
            if (!preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/', $youtubeUrl, $matches)) {
                return redirect()->back()->withErrors(['youtube_url' => 'Invalid YouTube URL. Please provide a valid YouTube video link.']);
            }

            $videoId = $matches[1];

            $thumbnailPath = null;
            if ($request->hasFile('thumbnail')) {
                $thumbnailPath = $request->file('thumbnail')->store('thumbnails', 'public');
            }

            // dd($videoId);
            // Generate Subtitle (.vtt)
            $subtitlePath = $this->generateYoutubeSubtitle($videoId);
            $hours   = $request->input('hours', 0);
            $minutes = $request->input('minutes', 0);
            $seconds = $request->input('seconds', 0);
            $videoDuration = ($hours * 3600) + ($minutes * 60) + $seconds;
            Video::create([
                'title' => $request->title,
                'video_path' => $youtubeUrl, // Store the YouTube URL directly
                'is_youtube' => true,
                'thumbnail_path' => $thumbnailPath,
                'thumbnail_timing' => $videoDuration,
                'subtitle_path' => $subtitlePath,
            ]);

            return redirect()->route('videos.index')->with('success', 'YouTube video and auto-generated subtitles saved successfully!');
        }

        // Local Upload Logic (Existing)
        $request->validate([
            'videos.*' => 'required|mimes:mp4,mov,avi,wmv|max:20000',
            'thumbnails.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5000',
            'titles.*' => 'required|string|max:255',
            // 'timings.*' => 'required|integer|min:1',
        ]);

        if ($request->hasFile('videos')) {
            foreach ($request->file('videos') as $index => $videoFile) {
                $videoPath = $videoFile->store('videos', 'public');

                $thumbnailPath = null;
                if ($request->hasFile("thumbnails") && isset($request->file("thumbnails")[$index])) {
                    $thumbnailPath = $request->file("thumbnails")[$index]->store('thumbnails', 'public');
                }
                $hours   = $request->input('hours', 0);
                $minutes = $request->input('minutes', 0);
                $seconds = $request->input('seconds', 0);
                $videoDuration = ($hours * 3600) + ($minutes * 60) + $seconds;

                Video::create([
                    'title' => $request->titles[$index],
                    'video_path' => $videoPath,
                    'is_youtube' => false,
                    'thumbnail_path' => $thumbnailPath,
                    'thumbnail_timing' =>  $videoDuration ?? 10,
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

    private function generateYoutubeSubtitle($videoId)
    {
        try {
            $client = new \GuzzleHttp\Client([
                'timeout' => 60,
            ]);

            $response = $client->get(
                'https://transcriptapi.com/api/v2/youtube/transcript',
                [
                    'headers' => [
                        'Authorization' => 'Bearer ' . env('TRANSCRIPT_API_KEY'),
                        'Accept' => 'application/json',
                    ],
                    'query' => [
                        'video_url' => $videoId,
                    ],
                ]
            );

            $data = json_decode($response->getBody(), true);

            if (empty($data['transcript']) || !is_array($data['transcript'])) {
                throw new \Exception('Transcript data missing');
            }

            // Build VTT
            $vtt = "WEBVTT\n\n";

            foreach ($data['transcript'] as $row) {
                $start = (float) $row['start'];
                $end   = $start + (float) $row['duration'];

                $text = html_entity_decode(
                    trim($row['text']),
                    ENT_QUOTES | ENT_HTML5,
                    'UTF-8'
                );

                // Skip empty or music-only cues if needed
                if ($text === '') {
                    continue;
                }

                $vtt .= $this->formatVttTime($start)
                    . " --> "
                    . $this->formatVttTime($end)
                    . "\n";

                $vtt .= $text . "\n\n";
            }

            $filename = 'subtitles/yt_' . $videoId . '_' . time() . '.vtt';
            Storage::disk('public')->put($filename, $vtt);

            return $filename;
        } catch (\Exception $e) {
            Log::error("TranscriptAPI failed for {$videoId}: " . $e->getMessage());

            // Fallback
            return $this->generateYoutubeSubtitleViaTimedText($videoId);
        }
    }

    private function formatVttTime($seconds)
    {
        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        $secs = floor($seconds % 60);
        $millis = floor(($seconds - floor($seconds)) * 1000);

        return sprintf('%02d:%02d:%02d.%03d', $hours, $minutes, $secs, $millis);
    }



    /**
     * Original fallback you provided (kept as-is, renamed slightly)
     */
    private function generateYoutubeSubtitleViaTimedText($videoId)
    {
        try {
            $url = "https://www.youtube.com/api/timedtext?lang=en&v=" . $videoId;
            $xmlString = @file_get_contents($url);

            if (!$xmlString || strpos($xmlString, '<transcript>') === false) {
                $url = "https://www.youtube.com/api/timedtext?lang=en&v=" . $videoId . "&kind=asr";
                $xmlString = @file_get_contents($url);
            }

            if ($xmlString && strpos($xmlString, '<transcript>') !== false) {
                $vttContent = "WEBVTT\n\n";
                $xml = simplexml_load_string($xmlString);

                if ($xml) {
                    foreach ($xml->text as $text) {
                        $start = (float)$text['start'];
                        $dur = (float)$text['dur'];
                        $end = $start + $dur;

                        $vttContent .= $this->formatVttTime($start) . " --> " . $this->formatVttTime($end) . "\n";
                        $cleanText = html_entity_decode((string)$text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
                        $vttContent .= $cleanText . "\n\n";
                    }

                    $filename = 'subtitles/yt_' . $videoId . '_' . time() . '.vtt';
                    Storage::disk('public')->put($filename, $vttContent);
                    return $filename;
                }
            }
        } catch (\Exception $e) {
            Log::error("Failed to generate YouTube subtitle via timedtext: " . $e->getMessage());
        }

        return null;
    }
}
