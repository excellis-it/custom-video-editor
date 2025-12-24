<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Gallery & Upload - Just Imagine</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/styles.css') }}">
    <style>
        body {
            background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%);
            color: #F8FAFC;
            min-height: 100vh;
            position: relative;
            overflow-x: hidden;
        }

        /* Animated background elements */
        body::before {
            content: '';
            position: fixed;
            top: -50%;
            right: -50%;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
            animation: float 20s ease-in-out infinite;
            z-index: 0;
        }

        body::after {
            content: '';
            position: fixed;
            bottom: -50%;
            left: -50%;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%);
            animation: float 25s ease-in-out infinite reverse;
            z-index: 0;
        }

        @keyframes float {

            0%,
            100% {
                transform: translate(0, 0) rotate(0deg);
            }

            33% {
                transform: translate(30px, -30px) rotate(120deg);
            }

            66% {
                transform: translate(-20px, 20px) rotate(240deg);
            }
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 40px 20px;
            position: relative;
            z-index: 1;
        }

        /* Header Styles */
        .header {
            text-align: center;
            margin-bottom: 60px;
            animation: fadeInDown 0.8s ease-out;
        }

        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .logo {
            height: 120px;
            margin-bottom: 20px;
            filter: drop-shadow(0 8px 24px rgba(139, 92, 246, 0.3));
            animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {

            0%,
            100% {
                transform: scale(1);
            }

            50% {
                transform: scale(1.05);
            }
        }

        .header h1 {
            font-size: 3rem;
            background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F97316 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 15px;
            font-weight: 800;
            letter-spacing: -0.5px;
            text-shadow: 0 4px 20px rgba(139, 92, 246, 0.2);
        }

        .header p {
            color: #CBD5E1;
            font-size: 1.1rem;
            font-weight: 400;
        }

        /* Upload Section */
        .upload-section {
            background: rgba(30, 41, 59, 0.6);
            backdrop-filter: blur(20px);
            border: 2px solid rgba(139, 92, 246, 0.2);
            border-radius: 24px;
            padding: 40px;
            margin-bottom: 60px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(139, 92, 246, 0.1);
            position: relative;
            overflow: hidden;
            animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .upload-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #8B5CF6 0%, #EC4899 50%, #F97316 100%);
        }

        .form-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 15px;
            background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-align: center;
        }

        .form-subtitle {
            color: #94a3b8;
            margin-bottom: 30px;
            text-align: center;
            font-size: 1rem;
        }

        .video-item-form {
            display: grid;
            gap: 20px;
            background: rgba(15, 23, 42, 0.6);
            padding: 25px;
            border-radius: 16px;
            border: 1px solid rgba(139, 92, 246, 0.1);
            transition: all 0.3s ease;
        }

        .video-item-form:hover {
            border-color: rgba(139, 92, 246, 0.3);
            box-shadow: 0 8px 24px rgba(139, 92, 246, 0.15);
        }

        input,
        select {
            background: rgba(15, 23, 42, 0.9);
            border: 2px solid rgba(139, 92, 246, 0.2);
            color: white;
            padding: 14px 18px;
            border-radius: 12px;
            width: 100%;
            font-size: 1rem;
            transition: all 0.3s ease;
            font-family: 'Inter', sans-serif;
        }

        input:focus,
        select:focus {
            outline: none;
            border-color: rgba(139, 92, 246, 0.6);
            box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1), 0 4px 12px rgba(139, 92, 246, 0.2);
        }

        input::placeholder {
            color: #64748B;
        }

        .input-group {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .file-input-wrapper {
            position: relative;
        }

        .file-input-label {
            font-size: 0.85rem;
            color: #CBD5E1;
            margin-bottom: 8px;
            display: block;
            font-weight: 500;
        }

        input[type="file"] {
            padding: 12px;
            cursor: pointer;
        }

        .time-inputs {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-top: 8px;
        }

        .time-inputs input {
            text-align: center;
            font-weight: 600;
        }

        /* Buttons */
        .btn-submit {
            background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F97316 100%);
            color: white;
            border: none;
            padding: 16px 40px;
            border-radius: 14px;
            cursor: pointer;
            font-weight: 700;
            width: 100%;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            margin-top: 20px;
            box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4), 0 4px 12px rgba(236, 72, 153, 0.3);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .btn-submit:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 32px rgba(139, 92, 246, 0.5), 0 6px 16px rgba(236, 72, 153, 0.4);
        }

        .btn-submit:active {
            transform: translateY(-1px);
        }

        /* Gallery Section */
        .gallery-section {
            animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        .gallery-section .form-title {
            text-align: center;
            margin-bottom: 40px;
            font-size: 2rem;
        }

        .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 30px;
        }

        .video-card {
            background: rgba(30, 41, 59, 0.6);
            border-radius: 20px;
            overflow: hidden;
            border: 2px solid rgba(139, 92, 246, 0.15);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            backdrop-filter: blur(10px);
        }

        .video-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #8B5CF6 0%, #EC4899 50%, #F97316 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .video-card:hover {
            transform: translateY(-12px);
            border-color: rgba(139, 92, 246, 0.5);
            box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4), 0 0 40px rgba(139, 92, 246, 0.3);
        }

        .video-card:hover::before {
            opacity: 1;
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
            transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .video-card:hover .thumbnail-box img {
            transform: scale(1.1);
        }

        .play-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.7) 0%, rgba(236, 72, 153, 0.7) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.4s ease;
        }

        .video-card:hover .play-overlay {
            opacity: 1;
        }

        .play-icon-mini {
            width: 70px;
            height: 70px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #8B5CF6;
            font-size: 2rem;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            transform: scale(0.8);
            transition: transform 0.3s ease;
        }

        .video-card:hover .play-icon-mini {
            transform: scale(1);
        }

        .video-info {
            padding: 20px;
        }

        .video-title {
            font-weight: 700;
            font-size: 1.2rem;
            margin-bottom: 8px;
            color: #F8FAFC;
            line-height: 1.4;
        }

        .video-meta {
            font-size: 0.9rem;
            color: #94a3b8;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .video-meta::before {
            content: '⏱';
            font-size: 1.1rem;
        }

        /* Loading Overlay */
        .loading-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.98);
            backdrop-filter: blur(20px);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }

        .premium-spinner {
            width: 80px;
            height: 80px;
            border: 6px solid rgba(139, 92, 246, 0.1);
            border-top: 6px solid #8B5CF6;
            border-right: 6px solid #EC4899;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 30px;
            box-shadow: 0 0 40px rgba(139, 92, 246, 0.4), 0 0 60px rgba(236, 72, 153, 0.3);
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
            font-size: 2rem;
            margin-bottom: 15px;
            background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F97316 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 800;
        }

        .loader-content p {
            color: #CBD5E1;
            font-size: 1.1rem;
        }

        /* Alert Messages */
        .alert-success {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
            color: #10b981;
            padding: 18px 24px;
            border-radius: 14px;
            border: 2px solid rgba(16, 185, 129, 0.3);
            margin-bottom: 30px;
            text-align: center;
            font-weight: 600;
            animation: slideIn 0.5s ease-out;
        }

        .alert-error {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
            color: #ef4444;
            padding: 18px 24px;
            border-radius: 14px;
            border: 2px solid rgba(239, 68, 68, 0.3);
            margin-bottom: 30px;
            font-weight: 600;
            animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .alert-error ul {
            margin: 0;
            padding-left: 20px;
        }

        /* Empty State */
        .empty-state {
            grid-column: 1/-1;
            text-align: center;
            padding: 80px 20px;
            color: #64748B;
        }

        .empty-state-icon {
            font-size: 4rem;
            margin-bottom: 20px;
            opacity: 0.5;
        }

        .empty-state-text {
            font-size: 1.2rem;
            font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }

            .logo {
                height: 80px;
            }

            .upload-section {
                padding: 25px;
            }

            .input-group {
                grid-template-columns: 1fr;
            }

            .gallery {
                grid-template-columns: 1fr;
            }

            .form-title {
                font-size: 1.3rem;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <header class="header">
            <img src="{{ asset('images/logo.png') }}" alt="Logo" class="logo">
            <h1>Just Imagine Video Player</h1>
            <p>Upload and manage your videos with custom thumbnails</p>
        </header>

        @if (session('success'))
            <div class="alert-success">
                ✓ {{ session('success') }}
            </div>
        @endif

        @if ($errors->any())
            <div class="alert-error">
                <ul>
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <section class="upload-section" id="youtube-upload">
            <h2 class="form-title">🎬 Add YouTube Video</h2>
            <p class="form-subtitle">Paste a YouTube link to add it to your video gallery. The video will play directly
                from YouTube.</p>
            <form action="{{ route('videos.store') }}" method="POST" enctype="multipart/form-data" id="youtubeForm"
                onsubmit="showLoader()">
                @csrf
                <input type="hidden" name="is_youtube" value="1">
                <div class="video-item-form">
                    <input type="text" name="youtube_url"
                        placeholder="🔗 Paste YouTube Link (e.g., https://www.youtube.com/watch?v=...)" required>
                    <input type="text" name="title" placeholder="📝 Video Title" required>

                    <div class="input-group">
                        <div class="file-input-wrapper">
                            <label class="file-input-label">🖼️ Custom Thumbnail (Optional)</label>
                            <input type="file" name="thumbnail" accept="image/*">
                        </div>

                        <div class="file-input-wrapper">
                            <label class="file-input-label">⏱️ Overlay Timing (Optional)</label>
                            <div class="time-inputs">
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
                <button type="submit" class="btn-submit">✨ Add to Gallery</button>
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
            <h2 class="form-title">🎥 Your Video Gallery</h2>
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
                                        style="width: 100%; height: 100%; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); display: flex; align-items: center; justify-content: center; font-size: 3rem; opacity: 0.3;">
                                        🎬
                                    </div>
                                @endif
                                <div class="play-overlay">
                                    <div class="play-icon-mini">▶</div>
                                </div>
                            </div>
                            <div class="video-info">
                                <h3 class="video-title">{{ $video->title }}</h3>
                                <div class="video-meta">
                                    <span>Overlay: {{ intdiv($video->thumbnail_timing, 3600) }}h
                                        {{ intdiv($video->thumbnail_timing % 3600, 60) }}m
                                        {{ $video->thumbnail_timing % 60 }}s</span>
                                </div>
                            </div>
                        </article>
                    </a>
                @empty
                    <div class="empty-state">
                        <div class="empty-state-icon">📹</div>
                        <p class="empty-state-text">No videos in your gallery yet.<br>Add your first YouTube video
                            above!</p>
                    </div>
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
