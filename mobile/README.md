# Aethria Voice Studio — Android Remote Control

A fast, lightweight, Apple-inspired **React Native (Android)** remote control designed exclusively for pair-programming and voice chatting with **Aethria Voice Studio**.

---

## ✦ Why No Phone Preview?
Per your design directive: **No heavy webview or canvas preview is rendered on the phone**.  
The phone serves as a **dedicated low-latency handheld controller**:
- **Voice Input & Chat**: Speak into your phone microphone or tap quick design suggestions to build components on your desktop in real-time.
- **Remote Studio Controls**: Instantly switch Desktop viewports (`Desktop`, `Tablet`, `Mobile`), trigger `Push to VS Code`, `Save Build`, `Undo`, and `Clear Canvas`.
- **Live Sync Stream**: Receive real-time AI status updates (`Generating UI...`, `Synced`, `Rendered`) and spoken conversational feedback.

---

## 🚀 How to Run on Android

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Start the Development Server
```bash
npm start
# or
npx expo start
```

### 3. Launch on Android:
- **On Android Emulator (Android Studio)**:  
  Press `a` in the terminal to launch on the running Android Virtual Device (AVD).  
  *Default host is configured to `http://10.0.2.2:5000` (the Android emulator loopback to your Mac's localhost).*
- **On Physical Android Phone**:  
  Install **Expo Go** from the Google Play Store. Scan the terminal QR code.  
  In the app, tap the top-right settings icon and enter your Mac's LAN IP (e.g. `http://192.168.1.15:5000`).

---

## 📡 Real-Time Sync Architecture

```
[ Android Remote App ]  <=== WebSockets (Socket.io) ===>  [ Aethria Backend (Port 5000) ]
       │                                                              │
       │                                                              │
  Voice Commands & Viewport                                      Real-Time Broadcast
       │                                                              │
       ▼                                                              ▼
[ Desktop Voice Studio ]  <================================ [ /sockets/voiceStudioSocket.js ]
(Renders Canvas & Tailwind)
```

### Sockets Events:
- `studio:join`: Joins room `AETH-STUDIO` with role `mobile`.
- `studio:voice_command`: Emits voice prompt to desktop (`handleCommand()`).
- `studio:control_action`: Emits `set_viewport`, `push_vscode`, `save_build`, `clear_canvas`.
- `studio:desktop_state`: Receives AI thinking status and assistant conversational turns.

---

## 🎨 Design System
- **Theme**: Apple / OLED Ultra-Dark (`#090A0D`, `#12141A`)
- **Accent**: Electric Indigo (`#4F46E5`), Emerald Status (`#10B981`)
- **Icons**: Lucide React Native
