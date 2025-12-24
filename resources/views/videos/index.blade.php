<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Gallery & Upload - Premium Editor</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/styles.css') }}">
    <style>
        body {
            background: #0f172a;
            color: #f8fafc;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 50px;
        }

        .header h1 {
            font-size: 2.5rem;
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }

        .upload-section {
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 50px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .form-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 20px;
            color: #e2e8f0;
        }

        .video-item-form {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr auto;
            gap: 15px;
            align-items: center;
            background: rgba(15, 23, 42, 0.5);
            padding: 15px;
            border-radius: 12px;
            margin-bottom: 10px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        input,
        select {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            width: 100%;
            font-size: 0.9rem;
        }

        .btn-add {
            background: #6366f1;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
            margin-bottom: 20px;
        }

        .btn-add:hover {
            background: #4f46e5;
            transform: translateY(-1px);
        }

        .btn-submit {
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            width: 100%;
            font-size: 1rem;
            transition: all 0.3s;
        }

        .btn-submit:hover {
            opacity: 0.9;
            transform: scale(1.01);
        }

        .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 30px;
        }

        .video-card {
            background: rgba(30, 41, 59, 0.5);
            border-radius: 15px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .video-card:hover {
            transform: translateY(-8px);
            border-color: rgba(99, 102, 241, 0.5);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .thumbnail-box {
            position: relative;
            aspect-ratio: 16/9;
            background: #000;
            overflow: hidden;
        }

        .thumbnail-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s;
        }

        .video-card:hover .thumbnail-box img {
            transform: scale(1.05);
        }

        .play-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s;
        }

        .video-card:hover .play-overlay {
            opacity: 1;
        }

        .play-icon-mini {
            width: 50px;
            height: 50px;
            background: #6366f1;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
        }

        .video-info {
            padding: 15px;
        }

        .video-title {
            font-weight: 600;
            font-size: 1.1rem;
            margin-bottom: 5px;
            color: #f1f5f9;
        }

        .video-meta {
            font-size: 0.85rem;
            color: #94a3b8;
        }

        .btn-remove {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            border: none;
            padding: 8px;
            border-radius: 6px;
            cursor: pointer;
        }

        /* Tabs and Loader Styles */
        .tabs {
            display: flex;
            gap: 15px;
            margin-bottom: 30px;
            justify-content: center;
        }

        .tab-btn {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #94a3b8;
            padding: 12px 30px;
            border-radius: 30px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s;
            font-size: 1rem;
        }

        .tab-btn.active {
            background: #6366f1;
            color: white;
            border-color: #6366f1;
            box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
        }

        .loading-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(10px);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }

        .premium-spinner {
            width: 70px;
            height: 70px;
            border: 5px solid rgba(99, 102, 241, 0.1);
            border-top: 5px solid #6366f1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 25px;
            box-shadow: 0 0 30px rgba(99, 102, 241, 0.2);
        }

        @keyframes spin {
            0% {
                transform: rotate(0deg);
            }

            100% {
                transform: rotate(360deg);
            }
        }

        .loader-content h3 {
            font-size: 1.8rem;
            margin-bottom: 12px;
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .loader-content p {
            color: #94a3b8;
            font-size: 1.1rem;
        }
        .head{
            margin-top: 0px;
        }
    </style>
</head>

<body>
    <div class="container">
        <header class="header">
            <img src="http://myjustimagine.excellisit.net/storage/company_logos/vhvxtG9oPyRGn2WDnX1aikD9iAkMsSR8e2Raanef.png" alt="Logo" class="logo">
            <h1 class="head">Just Imagine Video Player</h1>
            {{-- <p>Upload and manage your videos with custom thumbnails</p> --}}
        </header>

        @if (session('success'))
            <div
                style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 15px; border-radius: 10px; border: 1px solid rgba(16, 185, 129, 0.3); margin-bottom: 20px; text-align: center;">
                {{ session('success') }}
            </div>
        @endif

        @if ($errors->any())
            <div
                style="background: rgba(239, 68, 68, 0.2); color: #ef4444; padding: 15px; border-radius: 10px; border: 1px solid rgba(239, 68, 68, 0.3); margin-bottom: 20px;">
                <ul style="margin: 0; padding-left: 20px;">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        {{-- <div class="tabs">
            <button class="tab-btn active">Just Imagine Video Player</button>
        </div> --}}

        <section class="upload-section" id="youtube-upload">
            <h2 class="form-title">Add YouTube Video</h2>
            <p style="color: #94a3b8; margin-bottom: 20px; text-align: center;">Paste a YouTube link to add it to your
                video gallery. The video will play directly from YouTube.</p>
            <form action="{{ route('videos.store') }}" method="POST" enctype="multipart/form-data" id="youtubeForm"
                onsubmit="showLoader()">
                @csrf
                <input type="hidden" name="is_youtube" value="1">
                <div class="video-item-form" style="grid-template-columns: 1fr;">
                    <input type="text" name="youtube_url"
                        placeholder="Paste YouTube Link (e.g., https://www.youtube.com/watch?v=...)" required>
                    <input type="text" name="title" placeholder="Video Title" required>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div style="font-size: 0.75rem; color: #94a3b8;">Custom Thumbnail (Optional):<input
                                type="file" name="thumbnail" accept="image/*"></div>

                        <div style="font-size: 0.75rem; color: #94a3b8;">Overlay Timing (Optional):
                            <div
                                style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 8px;">
                                <input type="number" name="hours" placeholder="HH" min="0" max="23"
                                    value="0">
                                <input type="number" name="minutes" placeholder="MM" min="0" max="59"
                                    value="0">
                                <input type="number" name="seconds" placeholder="SS" min="0" max="59"
                                    value="0">
                            </div>
                        </div>
                    </div>
                </div>
                <button type="submit" class="btn-submit" style="margin-top: 20px;">Add to Gallery</button>
            </form>
        </section>

        <!-- Loading Overlay -->
        <div id="processingLoader" class="loading-overlay" style="display: none;">
            <div class="loader-content">
                <div class="premium-spinner"></div>
                <h3>Saving Video Link...</h3>
                <p>Adding your YouTube video to the gallery.</p>
            </div>
        </div>

        <section class="gallery-section">
            <h2 class="form-title">Your Video Gallery</h2>
            <div class="gallery">
                @forelse($videos as $video)
                    <a href="{{ route('videos.show', $video->id) }}" style="text-decoration: none; color: inherit;">
                        <article class="video-card">
                            <div class="thumbnail-box">
                                @if ($video->thumbnail_path)
                                    <img src="{{ asset('storage/' . $video->thumbnail_path) }}"
                                        alt="{{ $video->title }}">
                                @else
                                    <div
                                        style="width: 100%; height: 100%; background: #1e293b; display: flex; align-items: center; justify-content: center;">
                                        <span>No Thumbnail</span>
                                    </div>
                                @endif
                                <div class="play-overlay">
                                    <div class="play-icon-mini">▶</div>
                                </div>
                            </div>
                            <div class="video-info">
                                <h3 class="video-title">{{ $video->title }}</h3>
                                <div class="video-meta">
                                    <span>Overlay Timing: {{ intdiv($video->thumbnail_timing, 3600) }}h {{ intdiv($video->thumbnail_timing % 3600, 60) }}m {{ $video->thumbnail_timing % 60 }}s</span>
                                </div>
                            </div>
                        </article>
                    </a>
                @empty
                    <p style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px;">No videos
                        downloaded yet.</p>
                @endforelse
            </div>
        </section>
    </div>

    <script>
        function showLoader() {
            document.getElementById('processingLoader').style.display = 'flex';
        }
    </script>
</body>

</html>
</body>

</html>
