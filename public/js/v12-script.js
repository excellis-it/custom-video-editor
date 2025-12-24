// ===================================
// VIDEO EDITOR - MAIN JAVASCRIPT
// ===================================

class VideoEditor {
  constructor() {
    console.log("VideoEditor Instance Created - Version 1.2");
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

    // State
    this.thumbnailShown = true;
    this.thumbnailRemovalTime = parseInt(this.videoContainer.dataset.thumbnailTiming) || 10;
    this.isYoutube = this.videoContainer.dataset.isYoutube === 'true';
    this.subtitlePath = this.videoContainer.dataset.subtitlePath || '/subtitles/english.vtt';
    this.isDragging = false;
    this.player = null;
    this.ytPlayer = null;

    // Subtitle State
    this.subtitleOverlay = document.getElementById("customSubtitleOverlay");
    this.currentSubtitles = [];
    this.activeSubtitleIndex = -1;
    this.subtitlesEnabled = false;
    this.currentLang = 'original'; // 'original' or 'en'
    this.translationCache = {};

    this.init();
  }

  async init() {
    if (this.isYoutube) {
      this.ytPlayerContainer = document.getElementById('ytPlayerContainer');
      this.ytInteractionLayer = document.getElementById('ytInteractionLayer');
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
      isReady: () => video.readyState >= 1,
      setCaptions: (lang) => {
        console.log("Setting local captions to:", lang);
        if (lang === 'off') {
            this.subtitlesEnabled = false;
            this.subtitleOverlay.innerHTML = '';
        } else {
            this.currentLang = lang;
            this.loadVttSubtitles(this.subtitlePath);
            this.subtitlesEnabled = true;
        }
      }
    };

    video.addEventListener("loadedmetadata", () => {
      this.durationDisplay.textContent = this.formatTime(video.duration);
    });
  }

  initYoutubePlayer() {
    return new Promise((resolve) => {
      const videoId = this.videoContainer.querySelector('#ytPlayerContainer').dataset.videoId;
      console.log("Initializing YouTube Player for ID:", videoId);

      const setupPlayer = () => {
        if (!videoId) {
            console.error("No YouTube Video ID found!");
            resolve();
            return;
        }

        this.ytPlayer = new YT.Player('youtubePlayer', {
          videoId: videoId,
          playerVars: {
            'autoplay': 0,
            'controls': 0,
            'modestbranding': 1,
            'rel': 0,
            'enablejsapi': 1,
            'iv_load_policy': 3,
            'disablekb': 1,
            // 'cc_load_policy': 1,
            // 'cc_lang_pref': 'en',
            'origin': window.location.origin
          },
          events: {
            'onReady': (event) => {
              console.log("YouTube Player Ready");

              // Bind a helper to change captions dynamically
              this.player = {
                play: () => this.ytPlayer.playVideo(),
                pause: () => this.ytPlayer.pauseVideo(),
                getCurrentTime: () => this.ytPlayer.getCurrentTime(),
                getDuration: () => this.ytPlayer.getDuration(),
                setCurrentTime: (t) => this.ytPlayer.seekTo(t, true),
                setVolume: (v) => this.ytPlayer.setVolume(v),
                getVolume: () => this.ytPlayer.getVolume(),
                setMuted: (m) => m ? this.ytPlayer.mute() : this.ytPlayer.unMute(),
                isMuted: () => this.ytPlayer.isMuted(),
                setPlaybackRate: (r) => this.ytPlayer.setPlaybackRate(r),
                setCaptions: (lang) => {
                    console.log("Setting captions forcefully to:", lang);
                    if (lang === 'off') {
                        this.subtitlesEnabled = false;
                        this.subtitleOverlay.innerHTML = '';
                    } else {
                        this.currentLang = lang;
                        this.loadVttSubtitles(this.subtitlePath);
                        this.subtitlesEnabled = true;
                    }
                },
                isPaused: () => {
                  const state = this.ytPlayer.getPlayerState();
                  return state !== YT.PlayerState.PLAYING && state !== YT.PlayerState.BUFFERING;
                },
                getElement: () => document.getElementById('youtubePlayer'),
                isReady: () => true
              };
              this.durationDisplay.textContent = this.formatTime(this.ytPlayer.getDuration());

              // Enable English (Auto) at first of the second
              if (this.player && this.player.setCaptions) {
                  this.player.setCaptions('original');
                  // Update UI menu
                  document.querySelectorAll(".subtitle-option").forEach(b => b.classList.toggle('active', b.dataset.lang === 'original'));
              }

              resolve();
            },
            'onStateChange': (event) => {
              const state = event.data;
              this.updatePlayPauseButton(state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING);

              // Force English captions again whenever play starts to ensure they stay active
              if (state === YT.PlayerState.PLAYING) {
                if (this.player && this.player.setCaptions) {
                   const activeLang = document.querySelector('.subtitle-option.active')?.dataset.lang;
                   if (activeLang === 'en') this.player.setCaptions('en');
                }
              }

              if (state === YT.PlayerState.BUFFERING) {
                  this.loadingSpinner.classList.add('active');
              } else {
                  this.loadingSpinner.classList.remove('active');
              }

              // Hide YouTube's suggested videos by resetting to 0
              if (state === YT.PlayerState.ENDED) {
                this.player.setCurrentTime(0);
                this.player.pause();
                this.thumbnailOverlay.classList.remove("hidden");
                this.thumbnailShown = true;
                // Optional: hide player again till next play
                this.ytPlayerContainer.style.display = 'none';
              }
            },
            'onError': (e) => {
                console.error("YouTube Player Error:", e.data);
                resolve();
            }
          }
        });
      };

      if (window.YT && window.YT.Player) {
        setupPlayer();
      } else {
        window.onYouTubeIframeAPIReady = () => {
          console.log("YouTube API Loaded");
          setupPlayer();
        };

        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
      }

      // Safeguard: resolve anyway after 10s if YT fails to load
      setTimeout(() => {
          if (!this.player) {
              console.warn("YouTube API timeout - using mock player");
              this.player = { play:()=>{}, pause:()=>{}, getCurrentTime:()=>0, getDuration:()=>0, setCurrentTime:()=>{}, setVolume:()=>{}, getVolume:()=>100, setMuted:()=>{}, isMuted:()=>false, setPlaybackRate:()=>{}, isPaused:()=>true, getElement:()=>null, isReady:()=>false };
              resolve();
          }
      }, 10000);
    });
  }

  setupEventListeners() {
    this.thumbnailOverlay.addEventListener("click", () => this.handleThumbnailClick());

    if (this.ytInteractionLayer) {
        this.ytInteractionLayer.addEventListener("click", () => this.togglePlayPause());
    }

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
        const speed = parseFloat(e.currentTarget.dataset.speed);
        this.player.setPlaybackRate(speed);
        this.speedLabel.textContent = `${speed}x`;
        this.speedMenu.classList.remove("active");
        document.querySelectorAll(".speed-option").forEach(b => b.classList.toggle('active', parseFloat(b.dataset.speed) === speed));
      });
    });

    this.fullscreenBtn.addEventListener("click", () => this.toggleFullscreen());

    // Subtitles
    this.subtitleBtn.addEventListener("click", () => this.subtitleMenu.classList.toggle("active"));
    document.querySelectorAll(".subtitle-option").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const lang = e.currentTarget.dataset.lang;
        if (this.player && this.player.setCaptions) {
            this.player.setCaptions(lang);
        }
        this.subtitleMenu.classList.remove("active");
        document.querySelectorAll(".subtitle-option").forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
      });
    });

    // Menu closing
    document.addEventListener("click", (e) => {
        if (!this.speedBtn.contains(e.target) && !this.speedMenu.contains(e.target)) this.speedMenu.classList.remove("active");
        if (!this.subtitleBtn.contains(e.target) && !this.subtitleMenu.contains(e.target)) this.subtitleMenu.classList.remove("active");
    });

    if (!this.isYoutube) {
        const video = this.player.getElement();
        video.addEventListener("play", () => this.updatePlayPauseButton(true));
        video.addEventListener("pause", () => this.updatePlayPauseButton(false));
        video.addEventListener("waiting", () => this.loadingSpinner.classList.add('active'));
        video.addEventListener("playing", () => this.loadingSpinner.classList.remove('active'));
        video.addEventListener("ended", () => {
          this.player.setCurrentTime(0);
          this.thumbnailOverlay.classList.remove("hidden");
          this.thumbnailShown = true;
          this.updatePlayPauseButton(false);
        });
    }
  }

  handleThumbnailClick() {
    if (this.isYoutube) {
      this.ytPlayerContainer.style.display = 'block';
    }
    this.player.play();
    // Note: We no longer hide the thumbnail immediately on click.
    // The updateLoop will handle hiding it once the removal time is reached.
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

      // "Simultaneous" Thumbnail Logic:
      // Show if within the first X seconds (e.g. 10s), hide if past it.
      // This allows the video to play in the background while the thumbnail covers it.
      const shouldShow = currentTime < this.thumbnailRemovalTime;

      if (shouldShow && !this.thumbnailShown) {
        this.thumbnailOverlay.classList.remove("hidden");
        this.thumbnailShown = true;
      } else if (!shouldShow && this.thumbnailShown) {
        this.thumbnailOverlay.classList.add("hidden");
        this.thumbnailShown = false;
      }
    }

    // Custom Subtitle Update
    if (this.subtitlesEnabled && this.player) {
        this.renderSubtitles(this.player.getCurrentTime());
    }

    requestAnimationFrame(() => this.updateLoop());
  }

  async loadVttSubtitles(url) {
    try {
        console.log("Loading VTT:", url);
        const response = await fetch(url);
        const text = await response.text();
        this.currentSubtitles = this.parseVTT(text);
        console.log(`Loaded ${this.currentSubtitles.length} subtitle cues`);
    } catch (e) {
        console.error("Failed to load VTT subtitles:", e);
    }
  }



  parseVTT(vttText) {
    const cues = [];
    const lines = vttText.split(/\r?\n/);
    let currentCue = null;

    const timeRegex = /([\d:]+\.\d+)\s+-->\s+([\d:]+\.\d+)/;

    for (let line of lines) {
        line = line.trim();
        if (!line || line === 'WEBVTT') continue;

        const timeMatch = line.match(timeRegex);
        if (timeMatch) {
            if (currentCue) cues.push(currentCue);
            currentCue = {
                start: this.parseVttTime(timeMatch[1]),
                end: this.parseVttTime(timeMatch[2]),
                text: ""
            };
        } else if (currentCue) {
            currentCue.text += (currentCue.text ? "\n" : "") + line;
        }
    }
    if (currentCue) cues.push(currentCue);
    return cues;
  }

  parseVttTime(timeStr) {
    const parts = timeStr.split(':');
    let seconds = 0;
    if (parts.length === 3) {
        seconds += parseFloat(parts[0]) * 3600;
        seconds += parseFloat(parts[1]) * 60;
        seconds += parseFloat(parts[2]);
    } else {
        seconds += parseFloat(parts[0]) * 60;
        seconds += parseFloat(parts[1]);
    }
    return seconds;
  }

  async renderSubtitles(currentTime) {
    const activeCue = this.currentSubtitles.find(cue => currentTime >= cue.start && currentTime <= cue.end);

    if (activeCue) {
        if (this.activeSubtitleIndex !== this.currentSubtitles.indexOf(activeCue)) {
            this.activeSubtitleIndex = this.currentSubtitles.indexOf(activeCue);

            let displayText = activeCue.text;

            if (this.currentLang === 'en') {
                displayText = await this.translateLive(activeCue.text, 'en');
            }

            this.subtitleOverlay.innerHTML = `<div class="custom-subtitle-text">${displayText.replace(/\n/g, '<br>')}</div>`;
        }
    } else {
        this.activeSubtitleIndex = -1;
        this.subtitleOverlay.innerHTML = '';
    }
  }

  async translateLive(text, targetLang) {
    if (this.translationCache[text]) return this.translationCache[text];

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        const data = await response.json();

        let translated = text;
        if (data && data[0]) {
            translated = data[0].map(item => item && item[0] ? item[0] : "").join("").trim();
        }

        this.translationCache[text] = translated;
        return translated;
    } catch (e) {
        console.error("Live translation failed:", e);
        return text; // Fallback to original
    }
  }

  togglePlayPause() {
    if (!this.player) return;
    if (this.player.isPaused()) {
      this.player.play();
      if (this.thumbnailShown) {
          this.thumbnailOverlay.classList.add("hidden");
          this.thumbnailShown = false;
          if (this.isYoutube) this.ytPlayerContainer.style.display = 'block';
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
    if (!this.player) return;
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
    if (!this.player) return;
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
    if (!this.player) return;
    const rect = this.progressBar.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    this.player.setCurrentTime(percentage * this.player.getDuration());
  }

  handleProgressDrag(e) {
    if (!this.isDragging || !this.player) return;
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
  console.log("DOM Content Loaded - Initializing VideoEditor v1.2");
  new VideoEditor();
});
