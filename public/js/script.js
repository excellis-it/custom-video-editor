// ===================================
// VIDEO EDITOR - MAIN JAVASCRIPT
// ===================================

class VideoEditor {
  constructor() {
    // DOM Elements
    this.video = document.getElementById("videoPlayer");
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
    this.statusDisplay = {textContent: ""}; // Mock status display since it was removed from HTML

    // State
    this.thumbnailShown = true;
    this.thumbnailRemovalTime = parseInt(this.videoContainer.dataset.thumbnailTiming) || 10; // seconds
    this.playbackStartTime = 0;
    this.currentSpeed = 1;
    this.currentSubtitleLang = "off";
    this.isDragging = false;

    // Initialize
    this.init();
    this.setupSubtitleTracks();
  }

  init() {
    this.setupEventListeners();
    this.setupVideoMetadata();
    this.setupKeyboardControls();
  }

  // ===================================
  // EVENT LISTENERS
  // ===================================
  setupEventListeners() {
    // Thumbnail overlay click
    this.thumbnailOverlay.addEventListener("click", () =>
      this.handleThumbnailClick()
    );

    // Play/Pause
    this.playPauseBtn.addEventListener("click", () => this.togglePlayPause());
    this.video.addEventListener("click", () => this.togglePlayPause());

    // Skip controls
    this.skipBackBtn.addEventListener("click", () => this.skip(-5));
    this.skipForwardBtn.addEventListener("click", () => this.skip(5));

    // Volume controls
    this.muteBtn.addEventListener("click", () => this.toggleMute());
    this.volumeSlider.addEventListener("input", (e) =>
      this.changeVolume(e.target.value)
    );

    // Progress bar
    this.progressBar.addEventListener("click", (e) => this.seek(e));
    this.progressBar.addEventListener(
      "mousedown",
      () => (this.isDragging = true)
    );
    document.addEventListener("mousemove", (e) => this.handleProgressDrag(e));
    document.addEventListener("mouseup", () => (this.isDragging = false));

    // Speed control
    this.speedBtn.addEventListener("click", () => this.toggleSpeedMenu());
    document.querySelectorAll(".speed-option").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.changeSpeed(e.target.dataset.speed)
      );
    });

    // Subtitle control
    this.subtitleBtn.addEventListener("click", () => this.toggleSubtitleMenu());
    document.querySelectorAll(".subtitle-option").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.changeSubtitle(e.target.dataset.lang)
      );
    });

    // Fullscreen
    this.fullscreenBtn.addEventListener("click", () => this.toggleFullscreen());
    document.addEventListener("fullscreenchange", () => this.updateFullscreenUI());

    // Resolution control
    this.resolutionBtn.addEventListener("click", () => this.toggleResolutionMenu());
    document.querySelectorAll(".resolution-option").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.changeResolution(e.target.textContent)
      );
    });

    // Video events
    this.video.addEventListener("timeupdate", () => this.handleTimeUpdate());
    this.video.addEventListener("loadedmetadata", () =>
      this.handleMetadataLoaded()
    );
    this.video.addEventListener("waiting", () => this.showLoading());
    this.video.addEventListener("canplay", () => this.hideLoading());
    this.video.addEventListener("play", () => this.updatePlayPauseButton(true));
    this.video.addEventListener("pause", () =>
      this.updatePlayPauseButton(false)
    );
    this.video.addEventListener("ended", () => this.handleVideoEnd());

    // Close menus when clicking outside
    document.addEventListener("click", (e) => this.handleOutsideClick(e));
  }

  // ===================================
  // VIDEO METADATA
  // ===================================
  setupVideoMetadata() {
    this.video.addEventListener("loadedmetadata", () => {
      const resolution = `${this.video.videoWidth} × ${this.video.videoHeight}`;
      this.resolutionDisplay.textContent = resolution;
    });
  }

  handleMetadataLoaded() {
    this.durationDisplay.textContent = this.formatTime(this.video.duration);
  }

  // ===================================
  // THUMBNAIL OVERLAY HANDLING
  // ===================================
  handleThumbnailClick() {
    this.thumbnailOverlay.classList.add("hidden");
    this.thumbnailShown = false;
    this.video.play();
    this.playbackStartTime = Date.now();
    this.updateStatus("Playing");
  }

  checkThumbnailRemoval() {
    // Only manage thumbnail based on time if it hasn't been manually dismissed
    // OR if we are seeking around.
    const elapsed = this.video.currentTime;

    if (elapsed < 0.1) {
        // Reset thumbnail if we return to the very beginning
        if (!this.thumbnailShown && this.video.paused) {
            this.thumbnailOverlay.classList.remove("hidden");
            this.thumbnailShown = true;
        }
    } else if (elapsed > this.thumbnailRemovalTime) {
      // Hide thumbnail if past removal time (e.g. 10s)
      if (this.thumbnailShown) {
        this.thumbnailOverlay.classList.add("hidden");
        this.thumbnailShown = false;
      }
    }
  }

  // ===================================
  // PLAYBACK CONTROLS
  // ===================================
  togglePlayPause() {
    if (this.video.paused) {
      if (this.thumbnailShown) {
        this.thumbnailOverlay.classList.add("hidden");
        this.thumbnailShown = false;
        this.playbackStartTime = Date.now();
      }
      this.video.play();
    } else {
      this.video.pause();
    }
  }

  updatePlayPauseButton(isPlaying) {
    const playIcon = this.playPauseBtn.querySelector(".play-icon");
    const pauseIcon = this.playPauseBtn.querySelector(".pause-icon");

    if (isPlaying) {
      playIcon.classList.add("hidden");
      pauseIcon.classList.remove("hidden");
      this.updateStatus("Playing");
    } else {
      playIcon.classList.remove("hidden");
      pauseIcon.classList.add("hidden");
      this.updateStatus("Paused");
    }
  }

  skip(seconds) {
    if (isNaN(this.video.duration)) return;

    // Hide thumbnail if we skip while it's still shown
    if (this.thumbnailShown) {
      this.thumbnailOverlay.classList.add("hidden");
      this.thumbnailShown = false;
    }

    const newTime = this.video.currentTime + seconds;
    this.video.currentTime = Math.max(
      0,
      Math.min(this.video.duration, newTime)
    );
    this.showSkipFeedback(seconds);
  }

  showSkipFeedback(seconds) {
    // Visual feedback for skip action
    const feedbackText = seconds > 0 ? "+5s" : "-5s";
    const feedback = document.createElement("div");
    feedback.textContent = feedbackText;
    feedback.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 3rem;
            font-weight: bold;
            color: white;
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
            z-index: 20;
            pointer-events: none;
            animation: fadeOut 0.5s ease forwards;
        `;

    this.videoContainer.appendChild(feedback);
    setTimeout(() => feedback.remove(), 500);
  }

  handleVideoEnd() {
    this.updateStatus("Ended");
    // Reset to beginning
    this.video.currentTime = 0;
    this.thumbnailOverlay.classList.remove("hidden");
    this.thumbnailShown = true;
  }

  // ===================================
  // VOLUME CONTROLS
  // ===================================
  toggleMute() {
    this.video.muted = !this.video.muted;
    this.updateMuteButton();
    this.volumeSlider.value = this.video.muted ? 0 : this.video.volume * 100;
  }

  updateMuteButton() {
    const volumeIcon = this.muteBtn.querySelector(".volume-icon");
    const muteIcon = this.muteBtn.querySelector(".mute-icon");

    if (this.video.muted || this.video.volume === 0) {
      volumeIcon.classList.add("hidden");
      muteIcon.classList.remove("hidden");
    } else {
      volumeIcon.classList.remove("hidden");
      muteIcon.classList.add("hidden");
    }
  }

  changeVolume(value) {
    const volume = value / 100;
    this.video.volume = volume;
    this.video.muted = volume === 0;
    this.updateMuteButton();
  }

  // ===================================
  // PROGRESS BAR
  // ===================================
  handleTimeUpdate() {
    // Don't update UI from video time while dragging to avoid jitter
    if (this.isDragging) return;

    // Update progress bar
    const duration = this.video.duration;
    const currentTime = this.video.currentTime;

    if (!isNaN(duration) && duration > 0) {
      const percentage = (currentTime / duration) * 100;
      this.progressFilled.style.width = `${percentage}%`;
      this.progressHandle.style.left = `${percentage}%`;

      // Check time display
      this.currentTimeDisplay.textContent = this.formatTime(currentTime);
    }

    // Check thumbnail removal/restore based on 10s window
    this.checkThumbnailRemoval();
  }

  seek(e) {
    if (isNaN(this.video.duration)) return;

    // Hide thumbnail on interaction
    if (this.thumbnailShown) {
      this.thumbnailOverlay.classList.add("hidden");
      this.thumbnailShown = false;
    }

    const rect = this.progressBar.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    this.video.currentTime = percentage * this.video.duration;

    // Update UI immediately
    this.progressFilled.style.width = `${percentage * 100}%`;
    this.progressHandle.style.left = `${percentage * 100}%`;
  }

  handleProgressDrag(e) {
    if (!this.isDragging || isNaN(this.video.duration)) return;

    // Hide thumbnail on interaction
    if (this.thumbnailShown) {
      this.thumbnailOverlay.classList.add("hidden");
      this.thumbnailShown = false;
    }

    const rect = this.progressBar.getBoundingClientRect();
    let percentage = (e.clientX - rect.left) / rect.width;
    percentage = Math.max(0, Math.min(1, percentage));

    // Update UI immediately for smooth "sliding"
    this.progressFilled.style.width = `${percentage * 100}%`;
    this.progressHandle.style.left = `${percentage * 100}%`;
    this.currentTimeDisplay.textContent = this.formatTime(percentage * this.video.duration);

    this.video.currentTime = percentage * this.video.duration;
  }

  // ===================================
  // SPEED CONTROL
  // ===================================
  toggleSpeedMenu() {
    this.speedMenu.classList.toggle("active");
    this.subtitleMenu.classList.remove("active");
  }

  changeSpeed(speed) {
    this.currentSpeed = parseFloat(speed);
    this.video.playbackRate = this.currentSpeed;
    this.speedLabel.textContent = `${this.currentSpeed}x`;

    // Update active state
    document.querySelectorAll(".speed-option").forEach((btn) => {
      btn.classList.toggle(
        "active",
        parseFloat(btn.dataset.speed) === this.currentSpeed
      );
    });

    this.speedMenu.classList.remove("active");
  }

  // ===================================
  // SUBTITLE CONTROL
  // ===================================
  toggleSubtitleMenu() {
    this.subtitleMenu.classList.toggle("active");
    this.speedMenu.classList.remove("active");
  }

  changeSubtitle(lang) {
    this.currentSubtitleLang = lang;

    // Set track modes
    Array.from(this.video.textTracks).forEach((track) => {
      if (track.language === lang && lang !== "off") {
        track.mode = "hidden"; // hidden allows us to listen to cues without browser UI
      } else {
        track.mode = "disabled";
      }
    });

    // Reset display if off
    if (lang === "off") {
      this.customSubtitles.classList.remove("active");
      this.customSubtitles.textContent = "";
    }

    // Update active state in UI
    document.querySelectorAll(".subtitle-option").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    this.subtitleMenu.classList.remove("active");
    console.log(`Subtitles changed to: ${lang}`);
  }

  setupSubtitleTracks() {
    const attachListeners = () => {
      Array.from(this.video.textTracks).forEach((track) => {
        // Remove existing to avoid duplicates
        track.oncuechange = null;

        track.oncuechange = () => {
          if (track.mode === "hidden" && track.language === this.currentSubtitleLang) {
            const cue = track.activeCues[0];
            if (cue) {
              this.customSubtitles.innerHTML = cue.text.replace(/\n/g, '<br>');
              this.customSubtitles.classList.add("active");
            } else {
              this.customSubtitles.classList.remove("active");
            }
          }
        };
      });
    };

    // Attach now if already loaded
    if (this.video.readyState >= 1) {
      attachListeners();
    }

    // Also attach on metadata load
    this.video.addEventListener("loadedmetadata", attachListeners);
  }


  // ===================================
  // FULLSCREEN
  // ===================================
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.videoContainer.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  updateFullscreenUI() {
    const maximizeIcon = this.fullscreenBtn.querySelector(".maximize-icon");
    const minimizeIcon = this.fullscreenBtn.querySelector(".minimize-icon");

    if (document.fullscreenElement) {
      maximizeIcon.classList.add("hidden");
      minimizeIcon.classList.remove("hidden");
    } else {
      maximizeIcon.classList.remove("hidden");
      minimizeIcon.classList.add("hidden");
    }
  }

  // ===================================
  // RESOLUTION CONTROL
  // ===================================
  toggleResolutionMenu() {
    this.resolutionMenu.classList.toggle("active");
    this.speedMenu.classList.remove("active");
    this.subtitleMenu.classList.remove("active");
  }

  changeResolution(res) {
    this.resolutionDisplay.textContent = res;

    // Update active state
    document.querySelectorAll(".resolution-option").forEach((btn) => {
      btn.classList.toggle("active", btn.textContent === res);
    });

    this.resolutionMenu.classList.remove("active");
    console.log(`Resolution changed to: ${res}`);
    // Note: In a real app, this would trigger a source change
  }

  // ===================================
  // KEYBOARD CONTROLS
  // ===================================
  setupKeyboardControls() {
    document.addEventListener("keydown", (e) => {
      // Prevent default for specific keys
      if (
        ["Space", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
          e.code
        )
      ) {
        e.preventDefault();
      }

      switch (e.code) {
        case "Space":
          this.togglePlayPause();
          break;
        case "ArrowLeft":
          this.skip(-5);
          break;
        case "ArrowRight":
          this.skip(5);
          break;
        case "ArrowUp":
          this.changeVolume(Math.min(100, this.video.volume * 100 + 10));
          this.volumeSlider.value = this.video.volume * 100;
          break;
        case "ArrowDown":
          this.changeVolume(Math.max(0, this.video.volume * 100 - 10));
          this.volumeSlider.value = this.video.volume * 100;
          break;
        case "KeyM":
          this.toggleMute();
          break;
        case "KeyF":
          this.toggleFullscreen();
          break;
      }
    });
  }

  // ===================================
  // UTILITY FUNCTIONS
  // ===================================
  formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  showLoading() {
    this.loadingSpinner.classList.add("active");
  }

  hideLoading() {
    this.loadingSpinner.classList.remove("active");
  }

  updateStatus(status) {
    this.statusDisplay.textContent = status;

    // Update badge color based on status
    this.statusDisplay.style.background =
      status === "Playing"
        ? "rgba(16, 185, 129, 0.2)"
        : status === "Paused"
        ? "rgba(245, 158, 11, 0.2)"
        : status === "Ended"
        ? "rgba(239, 68, 68, 0.2)"
        : "rgba(16, 185, 129, 0.2)";

    this.statusDisplay.style.color =
      status === "Playing"
        ? "#10b981"
        : status === "Paused"
        ? "#f59e0b"
        : status === "Ended"
        ? "#ef4444"
        : "#10b981";
  }

  handleOutsideClick(e) {
    if (
      !this.speedBtn.contains(e.target) &&
      !this.speedMenu.contains(e.target)
    ) {
      this.speedMenu.classList.remove("active");
    }
    if (
      !this.subtitleBtn.contains(e.target) &&
      !this.subtitleMenu.contains(e.target)
    ) {
      this.subtitleMenu.classList.remove("active");
    }
    if (
      !this.resolutionBtn.contains(e.target) &&
      !this.resolutionMenu.contains(e.target)
    ) {
      this.resolutionMenu.classList.remove("active");
    }
  }
}

// ===================================
// ADD CUSTOM STYLES FOR ANIMATIONS
// ===================================
const style = document.createElement("style");
style.textContent = `
    @keyframes fadeOut {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.5);
        }
    }
`;
document.head.appendChild(style);

// ===================================
// INITIALIZE APP
// ===================================
document.addEventListener("DOMContentLoaded", () => {
  const editor = new VideoEditor();
  console.log("Custom Video Editor initialized successfully! 🎬");
  console.log("Keyboard shortcuts:");
  console.log("  Space: Play/Pause");
  console.log("  ← / →: Skip 5s backward/forward");
  console.log("  ↑ / ↓: Volume up/down");
  console.log("  M: Mute/Unmute");
  console.log("  F: Fullscreen");
});
