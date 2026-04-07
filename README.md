# SignSpeak — Real-time ASL to English Translator 🤟

SignSpeak is a modern, real-time American Sign Language (ASL) recognition system running entirely in the browser. It uses your webcam to detect hand gestures and body movements, translating them into English text instantly.

## 🚀 Features

*   **Real-time Recognition:** Decodes Fingerspelling (Alphabet A-Z) and common macro-signs instantly using a 20-frame buffered prediction engine to eliminate jitter.
*   **Production-grade Smoothing:** Implements Google MediaPipe's Exponential Moving Average (EMA) filtering system for raw 3D landmark stabilization.
*   **Body-Relative Signs:** Tracks Face Landmarks (forehead, chin, and lips) simultaneously. Now detects signs like *Think* (pointing to the temple) and *Eat* (fingers to mouth).
*   **Angular Feature Extraction:** Replaces static coordinates with robust Joint Angle calculations (PIP, MCP, Thumb) ensuring accurate detection regardless of hand size, rotation, or distance to the camera.
*   **Dynamic SVG Guides:** Detailed, parametric anatomical SVG hand generators in the Sign Guide panel ensure reference material is always crisp and responsive.
*   **Hold-to-Confirm Mechanism:** Built-in timers and visual progress rings prevent accidental triggers from resting hands.
*   **Signing Bounding Box:** Ignores gestures generated from relaxed/rest states by isolating detection solely to an invisible "Signing Region."

## 🛠️ Technology Stack

*   **Core:** HTML, CSS, JavaScript (Vanilla ES6 modules for maximum performance)
*   **Models:** Google MediaPipe (HandLandmarker & FaceLandmarker APIs running on WebAssembly)
*   **Sign Analysis engine:** [Fingerpose](https://github.com/andreasplesch/fingerpose) + Custom Advanced `LandmarkAnalyzer` for rotation-invariant tracking parsing complex palm orientation/distances.
*   **Build Tool:** Vite

## 🧠 Smart Systems

### Conflict Resolution & Disambiguation
Fingerspelling similar letters like `A`, `S`, `E`, and `T` is notoriously difficult for AI due to occluded thumbs in a closed fist. SignSpeak features explicit disambiguation rules overriding the standard heuristics (e.g., verifying thumb placement relative to index PIP) to drastically boost exact-match confidence.

### Motion Trajectory Tracker
Provides infrastructure for tracking letters requiring gestures mapped over time (like `J` and `Z`) by caching spatial movement over sliding windows.

## 💻 Getting Started Locally

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/signspeak.git
   cd signspeak
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the displayed `localhost` URL in your browser and allow camera permissions!

## 📜 Acknowledgements
* Built drawing inspiration from Google's research on spatial and temporal recognition systems.
* Fingerpose library for base static skeletal parsing.
