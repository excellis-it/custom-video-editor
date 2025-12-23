<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description"
        content="Advanced custom video editor with multi-language subtitles, playback controls, and premium features">
    <title>{{ $video->title }} - Premium Video Editor</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/styles.css') }}">
    <style>
        .back-btn {
            position: absolute;
            top: 20px;
            left: 20px;
            z-index: 1000;
            background: rgba(15, 23, 42, 0.7);
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.2s;
        }

        .back-btn:hover {
            background: rgba(15, 23, 42, 0.9);
            transform: translateX(-5px);
        }
    </style>
</head>

<body>
    <a href="{{ route('videos.index') }}" class="back-btn">← Back to Gallery</a>

    <div class="app-container">
        <!-- Main Content -->
        <main class="main-content">
            <!-- Video Player Section -->
            <div class="video-section">
                <div class="video-container" id="videoContainer" data-thumbnail-timing="{{ $video->thumbnail_timing }}"
                    data-is-youtube="{{ $video->is_youtube ? 'true' : 'false' }}">
                    <!-- Thumbnail Overlay -->
                    <div class="thumbnail-overlay" id="thumbnailOverlay"
                        style="{{ $video->thumbnail_path ? 'background-image: url(' . asset('storage/' . $video->thumbnail_path) . '); background-size: cover; background-position: center;' : '' }}">
                        <div class="thumbnail-content">
                            <div class="thumbnail-icon">▶</div>
                            <p class="thumbnail-text">Click to Play: {{ $video->title }}</p>
                        </div>
                    </div>

                    @if ($video->is_youtube)
                        <!-- YouTube Video Embed (API will replace this div) -->
                        @php
                            $videoId = '';
                            if (
                                preg_match(
                                    '/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/',
                                    $video->video_path,
                                    $matches,
                                )
                            ) {
                                $videoId = $matches[1];
                            }
                        @endphp
                        <div id="ytPlayerContainer"
                            style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; display: none; overflow: hidden;"
                            data-video-id="{{ $videoId }}">
                            <!-- Subtitle-Safe Clipping: Hide Top Title (-15%), keep bottom clear -->
                            <div id="youtubePlayer"
                                style="width: 100%; height: 120%; position: absolute; top: -15%; left: 0;">
                            </div>
                            <!-- Custom Subtitle Overlay -->
                            <div id="customSubtitleOverlay" class="custom-subtitle-overlay"></div>

                            <!-- Interaction layer captures clicks so YT iframe never sees the mouse -->
                            <div id="ytInteractionLayer"
                                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; cursor: pointer;">
                            </div>
                        </div>
                    @else
                        <!-- Local Video Element -->
                        <video id="videoPlayer" crossorigin="anonymous">
                            <source src="{{ asset('storage/' . $video->video_path) }}" type="video/mp4">
                            <!-- Default subtitle track if exists -->
                            <track kind="subtitles" src="{{ asset('subtitles/english.vtt') }}" srclang="en"
                                label="English">
                            Your browser does not support the video tag.
                        </video>
                    @endif

                    <!-- Custom Subtitle Display -->
                    <div class="custom-subtitles" id="customSubtitles"></div>

                    <!-- Loading Spinner -->
                    <div class="loading-spinner" id="loadingSpinner">
                        <div class="spinner"></div>
                    </div>

                    <!-- Video Controls -->
                    <div class="controls-panel">
                        <!-- Progress Bar -->
                        <div class="progress-container">
                            <div class="progress-bar" id="progressBar">
                                <div class="progress-filled" id="progressFilled"></div>
                                <div class="progress-handle" id="progressHandle"></div>
                            </div>
                            <div class="time-display">
                                <span id="currentTime">00:00</span>
                                <span class="time-separator"></span>
                                <span id="duration">00:00</span>
                            </div>
                        </div>

                        <!-- Control Buttons -->
                        <div class="controls-row">
                            <div class="controls-left">
                                <button class="control-btn primary-btn" id="playPauseBtn" title="Play/Pause">
                                    <svg class="play-icon" width="24" height="24" viewBox="0 0 24 24"
                                        fill="currentColor">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                    <svg class="pause-icon hidden" width="24" height="24" viewBox="0 0 24 24"
                                        fill="currentColor">
                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                    </svg>
                                </button>

                                <button class="control-btn" id="skipBackBtn" title="Skip 5s Backward">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" stroke-width="2">
                                        <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
                                    </svg>
                                    <span class="skip-label">5s</span>
                                </button>

                                <button class="control-btn" id="skipForwardBtn" title="Skip 5s Forward">
                                    <span class="skip-label">5s</span>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" stroke-width="2">
                                        <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
                                    </svg>
                                </button>

                                <div class="volume-control">
                                    <button class="control-btn" id="muteBtn" title="Mute/Unmute">
                                        <svg class="volume-icon" width="24" height="24" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" stroke-width="2">
                                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                        </svg>
                                        <svg class="mute-icon hidden" width="24" height="24"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-width="2">
                                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                            <line x1="23" y1="9" x2="17" y2="15" />
                                            <line x1="17" y1="9" x2="23" y2="15" />
                                        </svg>
                                    </button>
                                    <div class="volume-slider-container">
                                        <input type="range" class="volume-slider" id="volumeSlider" min="0"
                                            max="100" value="100">
                                    </div>
                                </div>
                            </div>

                            <div class="controls-right">
                                <div class="resolution-control">
                                    <button class="control-btn" id="resolutionBtn" title="Video Resolution">
                                        <span class="resolution-label" id="resolution">720p</span>
                                    </button>
                                    <div class="resolution-menu" id="resolutionMenu">
                                        <button class="resolution-option" data-res="360">360p</button>
                                        <button class="resolution-option" data-res="480">480p</button>
                                        <button class="resolution-option active" data-res="720">720p</button>
                                        <button class="resolution-option" data-res="1080">1080p</button>
                                    </div>
                                </div>

                                <div class="speed-control">
                                    <button class="control-btn" id="speedBtn" title="Playback Speed">
                                        <span class="speed-label" id="speedLabel">1x</span>
                                    </button>
                                    <div class="speed-menu" id="speedMenu">
                                        <button class="speed-option" data-speed="0.25">0.25x</button>
                                        <button class="speed-option" data-speed="0.5">0.5x</button>
                                        <button class="speed-option" data-speed="0.75">0.75x</button>
                                        <button class="speed-option active" data-speed="1">1x</button>
                                        <button class="speed-option" data-speed="1.25">1.25x</button>
                                        <button class="speed-option" data-speed="1.5">1.5x</button>
                                        <button class="speed-option" data-speed="1.75">1.75x</button>
                                        <button class="speed-option" data-speed="2">2x</button>
                                    </div>
                                </div>

                                <div class="subtitle-control">
                                    <button class="control-btn" id="subtitleBtn" title="Subtitles">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2">
                                            <rect x="2" y="4" width="20" height="16" rx="2" />
                                            <path d="M7 15h4m6 0h2M7 11h2m4 0h6" />
                                        </svg>
                                    </button>
                                    <div class="subtitle-menu" id="subtitleMenu">
                                        <button class="subtitle-option" data-lang="off">Off</button>
                                        <button class="subtitle-option active" data-lang="en">English (Auto)</button>
                                    </div>
                                </div>

                                <button class="control-btn" id="fullscreenBtn" title="Toggle Fullscreen">
                                    <svg class="maximize-icon" width="20" height="20" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2">
                                        <path
                                            d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                                    </svg>
                                    <svg class="minimize-icon hidden" width="20" height="20"
                                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path
                                            d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="{{ asset('js/v12-script.js') }}"></script>
</body>

</html>
