// ===================================
// VIDEO EDITOR - MAIN JAVASCRIPT
// ===================================

class VideoEditor {
  constructor() {
    // DOM Elements
    this.thumbnailOverlay = document.getElementById("thumbnailOverlay");
    this.playPauseBtn = document.getElementById("playPauseBtn");
    this.skipBackBtn = document.getElementById("skipBackBtn");
    this.skipForwardBtn = document.getElementById("skipForwardBtn");
    this.muteBtn = document.getElementById("muteBtn");
    this.volumeSlider = document.getElementById("volumeSlider");
    this.progressBar = document.getElementById("progressBar");
    this.progressFilled = document.getElementById("progressFilled");
    this.progressHandle = document.getElementById("progressHandle");
    this.currentTimeDisplay = document.getElementById("currentTime");
    this.durationDisplay = document.getElementById("duration");
    this.speedBtn = document.getElementById("speedBtn");
    this.speedMenu = document.getElementById("speedMenu");
    this.speedLabel = document.getElementById("speedLabel");
    this.subtitleBtn = document.getElementById("subtitleBtn");
    this.subtitleMenu = document.getElementById("subtitleMenu");
    this.customSubtitles = document.getElementById("customSubtitles");
    this.loadingSpinner = document.getElementById("loadingSpinner");
    this.fullscreenBtn = document.getElementById("fullscreenBtn");
    this.videoContainer = document.getElementById("videoContainer");
    this.resolutionDisplay = document.getElementById("resolution");
    this.resolutionBtn = document.getElementById("resolutionBtn");
    this.resolutionMenu = document.getElementById("resolutionMenu");
    this.statusDisplay = { textContent: "" };

    // State
    this.thumbnailShown = true;
    this.thumbnailRemovalTime = parseInt(this.videoContainer.dataset.thumbnailTiming) || 10;
    this.isYoutube = this.videoContainer.dataset.isYoutube === 'true';
    this.isDragging = false;
    this.player = null;

    this.init();
  }

  async init() {
    if (this.isYoutube) {
      await this.initYoutubePlayer();
    } else {
      this.initLocalPlayer();
    }

    this.setupEventListeners();
    this.setupKeyboardControls();

    // Start progress loop
    this.updateLoop();
  }

  initLocalPlayer() {
    const video = document.getElementById("videoPlayer");
    this.player = {
      play: () => video.play(),
      pause: () => video.pause(),
      getCurrentTime: () => video.currentTime,
      getDuration: () => video.duration,
      setCurrentTime: (t) => (video.currentTime = t),
      setVolume: (v) => (video.volume = v / 100),
      getVolume: () => video.volume * 100,
      setMuted: (m) => (video.muted = m),
      isMuted: () => video.muted,
      setPlaybackRate: (r) => (video.playbackRate = r),
      isPaused: () => video.paused,
      getElement: () => video,
      isReady: () => video.readyState >= 1
    };

    video.addEventListener("loadedmetadata", () => {
      this.durationDisplay.textContent = this.formatTime(video.duration);
    });
  }

  initYoutubePlayer() {
    return new Promise((resolve) => {
      // Load YT API if not loaded
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      window.onYouTubeIframeAPIReady = () => {
        const ytPlayer = new YT.Player('youtubePlayer', {
          events: {
            'onReady': (event) => {
              this.player = {
                play: () => ytPlayer.playVideo(),
                pause: () => ytPlayer.pauseVideo(),
                getCurrentTime: () => ytPlayer.getCurrentTime(),
                getDuration: () => ytPlayer.getDuration(),
                setCurrentTime: (t) => ytPlayer.seekTo(t, true),
                setVolume: (v) => ytPlayer.setVolume(v),
                getVolume: () => ytPlayer.getVolume(),
                setMuted: (m) => m ? ytPlayer.mute() : ytPlayer.unMute(),
                isMuted: () => ytPlayer.isMuted(),
                setPlaybackRate: (r) => ytPlayer.setPlaybackRate(r),
                isPaused: () => ytPlayer.getPlayerState() !== YT.PlayerState.PLAYING,
                getElement: () => document.getElementById('youtubePlayer'),
                isReady: () => true
              };
              this.durationDisplay.textContent = this.formatTime(ytPlayer.getDuration());
              resolve();
            },
            'onStateChange': (event) => {
              this.updatePlayPauseButton(event.data === YT.PlayerState.PLAYING);
            }
          }
        });
      };

      // If API already loaded but ready not called
      if (window.YT && window.YT.Player) {
        window.onYouTubeIframeAPIReady();
      }
    });
  }

  setupEventListeners() {
    this.thumbnailOverlay.addEventListener("click", () => this.handleThumbnailClick());

    this.playPauseBtn.addEventListener("click", () => this.togglePlayPause());

    this.skipBackBtn.addEventListener("click", () => this.skip(-5));
    this.skipForwardBtn.addEventListener("click", () => this.skip(5));

    this.muteBtn.addEventListener("click", () => this.toggleMute());
    this.volumeSlider.addEventListener("input", (e) => this.player.setVolume(e.target.value));

    this.progressBar.addEventListener("click", (e) => this.seek(e));
    this.progressBar.addEventListener("mousedown", () => (this.isDragging = true));
    document.addEventListener("mousemove", (e) => this.handleProgressDrag(e));
    document.addEventListener("mouseup", () => (this.isDragging = false));

    this.speedBtn.addEventListener("click", () => this.speedMenu.classList.toggle("active"));
    document.querySelectorAll(".speed-option").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const speed = parseFloat(e.target.dataset.speed);
        this.player.setPlaybackRate(speed);
        this.speedLabel.textContent = `${speed}x`;
        this.speedMenu.classList.remove("active");
        document.querySelectorAll(".speed-option").forEach(b => b.classList.toggle('active', parseFloat(b.dataset.speed) === speed));
      });
    });

    this.fullscreenBtn.addEventListener("click", () => this.toggleFullscreen());

    // Menu closing
    document.addEventListener("click", (e) => {
        if (!this.speedBtn.contains(e.target) && !this.speedMenu.contains(e.target)) this.speedMenu.classList.remove("active");
    });

    if (!this.isYoutube) {
        const video = this.player.getElement();
        video.addEventListener("play", () => this.updatePlayPauseButton(true));
        video.addEventListener("pause", () => this.updatePlayPauseButton(false));
    }
  }

  handleThumbnailClick() {
    if (this.isYoutube) {
        document.getElementById('youtubePlayer').style.display = 'block';
    }
    this.player.play();
    this.thumbnailOverlay.classList.add("hidden");
    this.thumbnailShown = false;
  }

  updateLoop() {
    if (this.player && !this.isDragging) {
      const currentTime = this.player.getCurrentTime();
      const duration = this.player.getDuration();

      if (duration > 0) {
        const percentage = (currentTime / duration) * 100;
        this.progressFilled.style.width = `${percentage}%`;
        this.progressHandle.style.left = `${percentage}%`;
        this.currentTimeDisplay.textContent = this.formatTime(currentTime);
        this.durationDisplay.textContent = this.formatTime(duration);
      }

      // Thumbnail logic
      if (currentTime < this.thumbnailRemovalTime) {
          if (!this.thumbnailShown && this.player.isPaused()) {
            this.thumbnailOverlay.classList.remove("hidden");
            this.thumbnailShown = true;
          }
      } else {
        if (this.thumbnailShown) {
            this.thumbnailOverlay.classList.add("hidden");
            this.thumbnailShown = false;
        }
      }
    }
    requestAnimationFrame(() => this.updateLoop());
  }

  togglePlayPause() {
    if (this.player.isPaused()) {
      this.player.play();
      if (this.thumbnailShown) {
          this.thumbnailOverlay.classList.add("hidden");
          this.thumbnailShown = false;
          if (this.isYoutube) document.getElementById('youtubePlayer').style.display = 'block';
      }
    } else {
      this.player.pause();
    }
  }

  updatePlayPauseButton(isPlaying) {
    const playIcon = this.playPauseBtn.querySelector(".play-icon");
    const pauseIcon = this.playPauseBtn.querySelector(".pause-icon");
    if (isPlaying) {
      playIcon.classList.add("hidden");
      pauseIcon.classList.remove("hidden");
    } else {
      playIcon.classList.remove("hidden");
      pauseIcon.classList.add("hidden");
    }
  }

  skip(seconds) {
    const newTime = this.player.getCurrentTime() + seconds;
    this.player.setCurrentTime(Math.max(0, Math.min(this.player.getDuration(), newTime)));
    this.showSkipFeedback(seconds);
  }

  showSkipFeedback(seconds) {
    const feedbackText = seconds > 0 ? "+5s" : "-5s";
    const feedback = document.createElement("div");
    feedback.textContent = feedbackText;
    feedback.style.cssText = `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 3rem; font-weight: bold; color: white; text-shadow: 0 4px 8px rgba(0,0,0,0.5); z-index: 100; pointer-events: none; animation: fadeOut 0.5s ease forwards;`;
    this.videoContainer.appendChild(feedback);
    setTimeout(() => feedback.remove(), 500);
  }

  toggleMute() {
    const muted = !this.player.isMuted();
    this.player.setMuted(muted);
    this.updateMuteButton(muted);
  }

  updateMuteButton(muted) {
    const volumeIcon = this.muteBtn.querySelector(".volume-icon");
    const muteIcon = this.muteBtn.querySelector(".mute-icon");
    if (muted) {
      volumeIcon.classList.add("hidden");
      muteIcon.classList.remove("hidden");
      this.volumeSlider.value = 0;
    } else {
      volumeIcon.classList.remove("hidden");
      muteIcon.classList.add("hidden");
      this.volumeSlider.value = this.player.getVolume();
    }
  }

  seek(e) {
    const rect = this.progressBar.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    this.player.setCurrentTime(percentage * this.player.getDuration());
  }

  handleProgressDrag(e) {
    if (!this.isDragging) return;
    const rect = this.progressBar.getBoundingClientRect();
    let percentage = (e.clientX - rect.left) / rect.width;
    percentage = Math.max(0, Math.min(1, percentage));
    this.player.setCurrentTime(percentage * this.player.getDuration());
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.videoContainer.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  setupKeyboardControls() {
    document.addEventListener("keydown", (e) => {
      if (document.activeElement.tagName === 'INPUT') return;
      if (["Space", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.code)) e.preventDefault();
      switch (e.code) {
        case "Space": this.togglePlayPause(); break;
        case "ArrowLeft": this.skip(-5); break;
        case "ArrowRight": this.skip(5); break;
        case "KeyM": this.toggleMute(); break;
        case "KeyF": this.toggleFullscreen(); break;
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new VideoEditor();
});
