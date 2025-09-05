import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { userAPI } from "../services/api";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map());
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !user._id) return;

    // Initialize socket connection with robust URL computation
    const computeSocketUrl = () => {
      const envUrlRaw = (
        import.meta.env.VITE_SOCKET_URL ||
        import.meta.env.VITE_API_URL ||
        ""
      )
        .toString()
        .trim();

      const toSafeOrigin = (urlString) => {
        try {
          const u = new URL(urlString);
          const isHttp = u.protocol === "http:" || u.protocol === "https:";
          const validHost =
            u.hostname === "localhost" ||
            u.hostname === "127.0.0.1" ||
            u.hostname.includes(".");
          if (!isHttp || !validHost) return null;
          return `${u.protocol}//${u.host}`;
        } catch {
          return null;
        }
      };

      if (envUrlRaw) {
        // Ensure absolute form and drop path (e.g., /api)
        const candidate = /^https?:\/\//i.test(envUrlRaw)
          ? envUrlRaw
          : `https://${envUrlRaw}`;
        try {
          const p = new URL(candidate);
          const originOnly = `${p.protocol}//${p.host}`;
          const safe = toSafeOrigin(originOnly);
          if (safe) return safe;
        } catch (e) {
          console.warn("⚠️ Invalid socket env URL:", envUrlRaw, e?.message);
        }
      }

      const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      return isLocal ? "http://localhost:5000" : "https://api.epicescorts.live";
    };

    const socketUrl = computeSocketUrl();
    console.debug("[Socket] Using URL:", socketUrl);

    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      path: "/socket.io",
      timeout: 10000, // Reduced to 10 second timeout
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 5,
      forceNew: true,
    });

    setSocket(newSocket);

    // Connection events
    newSocket.on("connect", () => {
      console.log("🔌 Socket connected:", newSocket.id);
      setIsConnected(true);

      // Authenticate with the server
      const token =
        localStorage.getItem("token") || localStorage.getItem("auth");
      newSocket.emit("authenticate", {
        token,
        userId: user._id,
      });
    });

    newSocket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("🔌 Socket connection error:", error);
      setIsConnected(false);

      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (newSocket.disconnected) {
          console.log("🔄 Attempting to reconnect...");
          newSocket.connect();
        }
      }, 3000);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log(`🔌 Socket reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("🔌 Socket reconnection error:", error);
      setIsConnected(false);
    });

    newSocket.on("reconnect_failed", () => {
      console.error("🔌 Socket reconnection failed");
      setIsConnected(false);
    });

    // Online status events
    newSocket.on("user_online", ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    newSocket.on("user_offline", ({ userId }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    // Typing indicators
    newSocket.on("user_typing", ({ senderId }) => {
      setTypingUsers((prev) => new Map(prev).set(senderId, true));
    });

    newSocket.on("user_stopped_typing", ({ senderId }) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(senderId);
        return newMap;
      });
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Socket methods
  const sendMessage = (recipientId, content) => {
    if (!socket || !isConnected) {
      throw new Error("Socket not connected");
    }

    const messageId = Date.now().toString();

    // Send immediately without waiting for confirmation
    socket.emit("send_message", {
      senderId: user._id,
      recipientId,
      content,
      messageId,
    });

    // Return a promise that resolves immediately for non-blocking behavior
    return Promise.resolve({ messageId, success: true });
  };

  const startTyping = (recipientId) => {
    if (socket && isConnected) {
      socket.emit("typing_start", {
        senderId: user._id,
        recipientId,
      });
    }
  };

  const stopTyping = (recipientId) => {
    if (socket && isConnected) {
      socket.emit("typing_stop", {
        senderId: user._id,
        recipientId,
      });
    }
  };

  const markMessageAsRead = (messageId) => {
    if (socket && isConnected) {
      socket.emit("mark_read", {
        messageId,
        readerId: user._id,
      });
    }
  };

  const isUserOnline = (userId) => {
    // First check socket-based online status (real-time)
    if (onlineUsers.has(userId)) {
      return true;
    }

    // For better online status detection, we'll rely on the API
    // which calculates online status based on lastActive timestamp
    // This will be updated by the escort data that includes isOnline field
    return false;
  };

  // Function to check user's online status via API
  const checkUserOnlineStatus = async (userId) => {
    try {
      const response = await userAPI.getOnlineStatus(userId);
      return response.data?.data?.isOnline || false;
    } catch (error) {
      console.error("Error checking online status:", error);
      return false;
    }
  };

  const isUserTyping = (userId) => {
    return typingUsers.has(userId);
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
    markMessageAsRead,
    isUserOnline,
    isUserTyping,
    checkUserOnlineStatus,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
