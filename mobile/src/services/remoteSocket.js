import { io } from 'socket.io-client';

class RemoteSocketService {
  constructor() {
    this.socket = null;
    this.serverUrl = 'https://aethria-backend.onrender.com';
    this.currentRoomId = 'AETH-STUDIO';
    this.listeners = new Map();
    this.isConnected = false;
    this.hasDesktopPeer = false;
  }

  setServerUrl(url) {
    if (!url) return;
    let formatted = url.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = 'http://' + formatted;
    }
    this.serverUrl = formatted;
  }

  setRoomId(roomId) {
    if (!roomId) return;
    this.currentRoomId = roomId.trim().toUpperCase();
  }

  connect(customUrl = null, customRoom = null) {
    if (customUrl) this.setServerUrl(customUrl);
    if (customRoom) this.setRoomId(customRoom);

    if (this.socket) {
      this.socket.disconnect();
    }

    console.log(`[RemoteSocket] Connecting to ${this.serverUrl}...`);

    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    this.socket.on('connect', () => {
      console.log(`[RemoteSocket] Connected! Joining room ${this.currentRoomId}`);
      this.isConnected = true;
      this.emitState('connection_change', { isConnected: true });

      // Join as mobile remote controller
      this.socket.emit('studio:join', {
        roomId: this.currentRoomId,
        role: 'mobile'
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[RemoteSocket] Disconnected:', reason);
      this.isConnected = false;
      this.hasDesktopPeer = false;
      this.emitState('connection_change', { isConnected: false, hasDesktopPeer: false });
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[RemoteSocket] Connect error:', err.message);
      this.isConnected = false;
      this.emitState('connection_error', { error: err.message });
    });

    this.socket.on('studio:joined', (data) => {
      console.log('[RemoteSocket] Room join confirmed:', data);
      this.hasDesktopPeer = data.hasPeer || false;
      this.emitState('peer_status', { hasDesktop: this.hasDesktopPeer });
    });

    this.socket.on('studio:peer_status', (data) => {
      console.log('[RemoteSocket] Peer status updated:', data);
      this.hasDesktopPeer = data.hasDesktop || false;
      this.emitState('peer_status', data);
    });

    this.socket.on('studio:desktop_state', (state) => {
      this.emitState('desktop_state', state);
    });

    this.socket.on('studio:new_chat_message', (msg) => {
      this.emitState('chat_message', msg);
    });

    this.socket.on('studio:project_selected', (data) => {
      this.emitState('project_selected', data);
    });

    this.socket.on('studio:project_created', (data) => {
      this.emitState('project_created', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.hasDesktopPeer = false;
  }

  // Send voice prompt to desktop canvas
  sendVoiceCommand(text) {
    if (!text || !text.trim()) return false;
    if (!this.socket || !this.isConnected) {
      console.warn('[RemoteSocket] Cannot send command: socket disconnected');
      return false;
    }

    console.log(`[RemoteSocket] Sending voice command: "${text}"`);
    this.socket.emit('studio:voice_command', {
      text: text.trim(),
      timestamp: Date.now()
    });
    return true;
  }

  // Send remote control actions (viewport, save, clear, vs code push)
  sendControlAction(action, payload = null) {
    if (!this.socket || !this.isConnected) return false;
    console.log(`[RemoteSocket] Sending control action: ${action}`);
    this.socket.emit('studio:control_action', {
      action,
      payload,
      timestamp: Date.now()
    });
    return true;
  }

  // Synchronize active project selection with desktop
  selectProject(project) {
    if (!this.socket || !this.isConnected || !project) return false;
    console.log(`[RemoteSocket] Selecting project: ${project.name}`);
    this.socket.emit('studio:select_project', {
      projectId: project._id || project.id,
      projectName: project.name,
      framework: project.framework,
      workspacePath: project.workspacePath,
      timestamp: Date.now()
    });
    return true;
  }

  // Broadcast newly created project to desktop
  notifyProjectCreated(project) {
    if (!this.socket || !this.isConnected || !project) return false;
    this.socket.emit('studio:project_created', {
      project,
      timestamp: Date.now()
    });
    return true;
  }

  // Event subscription
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emitState(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => {
        try { cb(data); } catch (e) { console.error(e); }
      });
    }
  }
}

export const remoteSocket = new RemoteSocketService();
