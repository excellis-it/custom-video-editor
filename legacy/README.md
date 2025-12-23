# 🎬 Premium Custom Video Editor

A feature-rich, modern video player with custom controls, multi-language subtitles, and a beautiful UI.

## ✨ Features

### Core Functionality

- **Thumbnail Overlay**: Displays a stunning overlay for the first 10 seconds of playback
- **Play/Pause Control**: Click the video or use the dedicated button
- **5-Second Skip**: Jump forward or backward by 5 seconds
- **Variable Speed**: Choose from 0.25x to 2x playback speed
- **Volume Control**: Smooth volume slider with mute toggle
- **Multi-Language Subtitles**: Support for multiple subtitle tracks
- **Fullscreen Mode**: Immersive viewing experience
- **Keyboard Shortcuts**: Efficient control using your keyboard

### Design Highlights

- 🎨 Modern glassmorphism effects
- 🌈 Vibrant gradients and animations
- 📱 Fully responsive design
- ⚡ Smooth transitions and micro-animations
- 🎯 Premium, state-of-the-art UI

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Video file in MP4 format
- (Optional) Subtitle files in WebVTT (.vtt) format

### Installation

1. **Add Your Video**

   ```
   Place your video file in the project directory and update line 54 in index.html:
   <source src="your-video.mp4" type="video/mp4">
   ```

2. **Add Subtitles (Optional)**

   ```
   Create a 'subtitles' folder and add .vtt files:
   subtitles/
   ├── english.vtt
   ├── spanish.vtt
   ├── french.vtt
   └── etc...
   ```

3. **Open the Editor**
   ```
   Simply open index.html in your web browser!
   ```

## ⌨️ Keyboard Shortcuts

| Key     | Action                  |
| ------- | ----------------------- |
| `Space` | Play/Pause              |
| `←`     | Skip 5 seconds backward |
| `→`     | Skip 5 seconds forward  |
| `↑`     | Increase volume         |
| `↓`     | Decrease volume         |
| `M`     | Mute/Unmute             |
| `F`     | Toggle fullscreen       |

## 🎯 Features Breakdown

### 1. Thumbnail Overlay System

- Automatically shows for the first 10 seconds
- Smooth fade-out animation
- Click-to-play functionality
- Beautiful gradient background with blur effect

### 2. Playback Speed Control

Available speeds:

- 0.25× (Quarter speed)
- 0.5× (Half speed)
- 0.75× (Three-quarter speed)
- 1× (Normal speed)
- 1.25× (Faster)
- 1.5× (1.5× faster)
- 1.75× (Almost double)
- 2× (Double speed)

### 3. Multi-Language Subtitles

Supported languages (expandable):

- English
- Español (Spanish)
- Français (French)
- Deutsch (German)
- हिन्दी (Hindi)

To add more languages, update both the HTML and JavaScript files.

### 4. Custom Controls

- **Progress Bar**: Click to seek, drag to scrub
- **Time Display**: Current time / Total duration
- **Volume Slider**: Appears on hover for clean UI
- **Speed Menu**: Dropdown with all speed options
- **Subtitle Menu**: Select from available languages

## 📁 Project Structure

```
video-editor/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling with animations
├── script.js           # All functionality and interactions
├── README.md           # This file
└── subtitles/          # (Optional) Subtitle files
    ├── english.vtt
    ├── spanish.vtt
    └── ...
```

## 🎨 Customization

### Change Colors

Edit the CSS custom properties in `styles.css`:

```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --accent-primary: #667eea;
  /* Add your custom colors here */
}
```

### Adjust Thumbnail Duration

Edit `script.js` line 35:

```javascript
this.thumbnailRemovalTime = 10; // Change to your preferred seconds
```

### Modify Skip Duration

Edit the skip button event listeners in `script.js`:

```javascript
this.skipBackBtn.addEventListener("click", () => this.skip(-5)); // Change -5
this.skipForwardBtn.addEventListener("click", () => this.skip(5)); // Change 5
```

## 🌐 Creating Subtitle Files

Subtitles use the WebVTT format. Here's a simple example:

```vtt
WEBVTT

00:00:00.000 --> 00:00:05.000
This is the first subtitle

00:00:05.000 --> 00:00:10.000
This is the second subtitle
```

Save as `filename.vtt` and reference it in the HTML.

## 🔧 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📱 Mobile Support

The video editor is fully responsive and works great on:

- 📱 Smartphones
- 📱 Tablets
- 💻 Laptops
- 🖥️ Desktops

## 🐛 Troubleshooting

### Video doesn't load

- Check the file path in `index.html`
- Ensure the video format is MP4
- Verify the file is in the same directory

### Subtitles don't appear

- Make sure subtitle files are in WebVTT format
- Check the file paths in the HTML
- Verify the language codes match

### Controls not working

- Ensure JavaScript is enabled in your browser
- Check browser console for errors
- Try refreshing the page

## 🎯 Future Enhancements

Possible additions:

- [ ] Playlist support
- [ ] Video filters and effects
- [ ] Picture-in-picture mode
- [ ] Custom subtitle styling
- [ ] Video chapters
- [ ] Download progress indicator

## 📄 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Feel free to fork, modify, and improve this video editor!

---

**Enjoy your premium video editing experience! 🎬✨**
