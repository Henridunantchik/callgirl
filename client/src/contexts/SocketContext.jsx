import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
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

    // Initialize socket connection
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('🔌 Socket connected:', newSocket.id);
      setIsConnected(true);
      
      // Authenticate with the server
      const token = localStorage.getItem('token') || localStorage.getItem('auth');
      newSocket.emit('authenticate', {
        token,
        userId: user._id
      });
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      setIsConnected(false);
    });

    // Online status events
    newSocket.on('user_online', ({ userId }) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    newSocket.on('user_offline', ({ userId }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    // Typing indicators
    newSocket.on('user_typing', ({ senderId }) => {
      setTypingUsers(prev => new Map(prev).set(senderId, true));
    });

    newSocket.on('user_stopped_typing', ({ senderId }) => {
      setTypingUsers(prev => {
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
      throw new Error('Socket not connected');
    }
    
    return new Promise((resolve, reject) => {
      const messageId = Date.now().toString();
      
      socket.emit('send_message', {
        senderId: user._id,
        recipientId,
        content,
        messageId
      });

      // Listen for confirmation
      const handleMessageSent = (data) => {
        if (data.messageId === messageId) {
          socket.off('message_sent', handleMessageSent);
          socket.off('message_error', handleMessageError);
          resolve(data);
        }
      };

      const handleMessageError = (data) => {
        socket.off('message_sent', handleMessageSent);
        socket.off('message_error', handleMessageError);
        reject(new Error(data.error));
      };

      socket.on('message_sent', handleMessageSent);
      socket.on('message_error', handleMessageError);
    });
  };

  const startTyping = (recipientId) => {
    if (socket && isConnected) {
      socket.emit('typing_start', {
        senderId: user._id,
        recipientId
      });
    }
  };

  const stopTyping = (recipientId) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', {
        senderId: user._id,
        recipientId
      });
    }
  };

  const markMessageAsRead = (messageId) => {
    if (socket && isConnected) {
      socket.emit('mark_read', {
        messageId,
        readerId: user._id
      });
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
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
    isUserTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
