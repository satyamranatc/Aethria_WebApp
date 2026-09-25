/**
 * Aethria Voice Studio Real-Time Synchronization Socket Handler
 * Powers the Android Remote Control app connection with Desktop Voice Studio
 */

export function initVoiceStudioSockets(io) {
  const activeRooms = new Map(); // roomId -> { desktopSockets: Set, mobileSockets: Set }

  io.on("connection", (socket) => {
    let currentRoomId = null;
    let clientRole = "unknown";

    // 1. Join a Studio Pairing Room (e.g., "AETH-7492" or "user_<id>")
    socket.on("studio:join", ({ roomId, role = "mobile" }) => {
      if (!roomId) return;
      currentRoomId = roomId.trim().toUpperCase();
      clientRole = role;

      socket.join(currentRoomId);

      if (!activeRooms.has(currentRoomId)) {
        activeRooms.set(currentRoomId, {
          desktopSockets: new Set(),
          mobileSockets: new Set()
        });
      }

      const roomData = activeRooms.get(currentRoomId);
      if (role === "desktop") {
        roomData.desktopSockets.add(socket.id);
      } else {
        roomData.mobileSockets.add(socket.id);
      }

      console.log(`[Socket] ${role} (${socket.id}) joined studio room ${currentRoomId}`);

      // Notify the room about peer status
      io.to(currentRoomId).emit("studio:peer_status", {
        hasDesktop: roomData.desktopSockets.size > 0,
        hasMobile: roomData.mobileSockets.size > 0,
        desktopCount: roomData.desktopSockets.size,
        mobileCount: roomData.mobileSockets.size,
        joinedRole: role
      });

      // Confirm to joiner
      socket.emit("studio:joined", {
        roomId: currentRoomId,
        role,
        hasPeer: role === "mobile" ? roomData.desktopSockets.size > 0 : roomData.mobileSockets.size > 0
      });
    });

    // 2. Mobile sends voice prompt to Desktop Canvas
    socket.on("studio:voice_command", (data) => {
      if (!currentRoomId) return;
      console.log(`[Socket] Voice command from ${socket.id} in ${currentRoomId}:`, data?.text?.slice(0, 50));
      socket.to(currentRoomId).emit("studio:remote_voice_command", {
        text: data?.text || "",
        sender: clientRole,
        timestamp: Date.now()
      });
    });

    // 3. Mobile sends remote control action (viewport, save, clear, vs code push)
    socket.on("studio:control_action", (data) => {
      if (!currentRoomId) return;
      console.log(`[Socket] Control action from ${socket.id} in ${currentRoomId}:`, data?.action);
      socket.to(currentRoomId).emit("studio:remote_control_action", {
        action: data?.action, // 'set_viewport' | 'save_build' | 'clear_canvas' | 'push_vscode' | 'undo'
        payload: data?.payload || null,
        sender: clientRole
      });
    });

    // 4. Desktop reports live state (idle, thinking, rendering, assistant reply)
    socket.on("studio:state_update", (state) => {
      if (!currentRoomId) return;
      socket.to(currentRoomId).emit("studio:desktop_state", {
        ...state,
        timestamp: Date.now()
      });
    });

    // 5. Chat message sync
    socket.on("studio:chat_message", (message) => {
      if (!currentRoomId) return;
      socket.to(currentRoomId).emit("studio:new_chat_message", message);
    });

    // Clean disconnect
    socket.on("disconnect", () => {
      if (currentRoomId && activeRooms.has(currentRoomId)) {
        const roomData = activeRooms.get(currentRoomId);
        if (clientRole === "desktop") {
          roomData.desktopSockets.delete(socket.id);
        } else {
          roomData.mobileSockets.delete(socket.id);
        }

        if (roomData.desktopSockets.size === 0 && roomData.mobileSockets.size === 0) {
          activeRooms.delete(currentRoomId);
        } else {
          io.to(currentRoomId).emit("studio:peer_status", {
            hasDesktop: roomData.desktopSockets.size > 0,
            hasMobile: roomData.mobileSockets.size > 0,
            desktopCount: roomData.desktopSockets.size,
            mobileCount: roomData.mobileSockets.size,
            leftRole: clientRole
          });
        }
      }
      console.log(`[Socket] ${clientRole} (${socket.id}) disconnected`);
    });
  });
}
