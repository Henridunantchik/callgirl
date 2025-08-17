import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  Phone,
  Video,
  MoreVertical,
  Search,
  Filter,
  Trash2,
  Reply,
  Image as ImageIcon,
  Paperclip,
  Smile,
  Mic,
  Check,
  CheckCheck,
  Clock,
  User,
  Users,
} from "lucide-react";
import { showToast } from "../helpers/showToast";
import { messageAPI } from "../services/api";

const RealTimeMessenger = ({ isOpen, onClose, selectedEscort = null }) => {
  const { user } = useAuth();
  const {
    socket,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    markMessageAsRead,
    isUserOnline,
    isUserTyping,
  } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with selected escort if provided
  useEffect(() => {
    if (selectedEscort && !selectedChat) {
      setSelectedChat({
        user: selectedEscort,
        lastMessage: null,
        unreadCount: 0,
      });
    }
  }, [selectedEscort]);

  // Fetch conversations on mount
  useEffect(() => {
    if (isOpen && user && user._id) {
      fetchConversations();
    }
  }, [isOpen, user]);

  // Fetch messages when selected chat changes
  useEffect(() => {
    if (selectedChat && user && user._id) {
      fetchMessages(selectedChat.user._id);
    }
  }, [selectedChat, user]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !user || !user._id) return;

    // Listen for new messages
    const handleNewMessage = (data) => {
      const { message } = data;

      // Add to messages if it's for the current chat
      if (
        selectedChat &&
        (message.sender === selectedChat.user._id ||
          message.recipient === selectedChat.user._id)
      ) {
        setMessages((prev) => [...prev, message]);

        // Mark as read if we're the recipient
        if (message.recipient === user._id) {
          markMessageAsRead(message._id);
        }
      }

      // Update conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.user._id === message.sender ||
          conv.user._id === message.recipient
            ? {
                ...conv,
                lastMessage: message,
                unreadCount: conv.unreadCount + 1,
              }
            : conv
        )
      );
    };

    // Listen for message read receipts
    const handleMessageRead = (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId ? { ...msg, isRead: true } : msg
        )
      );
    };

    socket.on("new_message", handleNewMessage);
    socket.on("message_read", handleMessageRead);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_read", handleMessageRead);
    };
  }, [socket, selectedChat, user]);

  const fetchConversations = async () => {
    // Don't fetch if user is not authenticated
    if (!user || !user._id) {
      console.log("Skipping fetchConversations - user not authenticated");
      return;
    }

    try {
      setLoading(true);
      const response = await messageAPI.getUserConversations();

      if (response.data && response.data.data) {
        setConversations(response.data.data);

        // Auto-select first conversation if none selected
        if (response.data.data.length > 0 && !selectedChat) {
          setSelectedChat(response.data.data[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      showToast("error", "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (escortId) => {
    // Don't fetch if user is not authenticated
    if (!user || !user._id) {
      console.log("Skipping fetchMessages - user not authenticated");
      return;
    }

    try {
      const response = await messageAPI.getConversation(escortId);

      if (response.data && response.data.data) {
        setMessages(response.data.data.messages || []);

        // Mark messages as read
        const unreadMessages =
          response.data.data.messages?.filter(
            (msg) => !msg.isRead && msg.sender === escortId
          ) || [];

        unreadMessages.forEach((msg) => {
          markMessageAsRead(msg._id);
        });
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      showToast("error", "Failed to load messages");
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || sending || !user || !user._id) return;

    try {
      setSending(true);

      // Send via socket for real-time delivery
      await sendMessage(selectedChat.user._id, message.trim());

      // Add message to local state immediately for instant feedback
      const tempMessage = {
        _id: Date.now().toString(),
        sender: user._id,
        recipient: selectedChat.user._id,
        content: message.trim(),
        type: "text",
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempMessage]);
      setMessage("");

      // Update conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.user._id === selectedChat.user._id
            ? { ...conv, lastMessage: tempMessage }
            : conv
        )
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      showToast("error", "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);

    // Handle typing indicators (only if authenticated)
    if (!isTyping && user && user._id) {
      setIsTyping(true);
      startTyping(selectedChat?.user._id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (user && user._id) {
        stopTyping(selectedChat?.user._id);
      }
    }, 1000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMessageStatus = (message) => {
    if (message.sender === user._id) {
      if (message.isRead) {
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      } else {
        return <Check className="w-3 h-3 text-gray-400" />;
      }
    }
    return null;
  };

  if (!isOpen) return null;

  // Check if user is authenticated
  const isAuthenticated = user && user._id;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card
        className={`w-80 shadow-2xl border-0 ${isMinimized ? "h-12" : "h-96"}`}
      >
        {/* Header */}
        <CardHeader
          className="bg-blue-600 text-white p-3 cursor-pointer"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              {!isConnected && (
                <Badge variant="destructive" className="text-xs">
                  Offline
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(!isMinimized);
                }}
              >
                {isMinimized ? (
                  <Maximize2 className="w-3 h-3" />
                ) : (
                  <Minimize2 className="w-3 h-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 h-80 flex flex-col">
            {/* Authentication Check */}
            {!isAuthenticated ? (
              // Login prompt
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Sign in to Message
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    You need to be signed in to send messages
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/signin")}
                    className="w-full"
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            ) : !selectedChat ? (
              <div className="flex-1 overflow-y-auto">
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">
                      Loading...
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No conversations yet
                    </div>
                  ) : (
                    conversations
                      .filter(
                        (conv) =>
                          conv.user.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          conv.user.alias
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase())
                      )
                      .map((conversation) => (
                        <div
                          key={conversation.user._id}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b"
                          onClick={() => setSelectedChat(conversation)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={conversation.user.avatar} />
                                <AvatarFallback>
                                  {conversation.user.name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              {isUserOnline(conversation.user._id) && (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium truncate">
                                  {conversation.user.alias ||
                                    conversation.user.name}
                                </p>
                                {conversation.lastMessage && (
                                  <span className="text-xs text-gray-500">
                                    {formatTime(
                                      conversation.lastMessage.createdAt
                                    )}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500 truncate">
                                  {conversation.lastMessage?.content ||
                                    "No messages yet"}
                                </p>
                                {conversation.unreadCount > 0 && (
                                  <Badge className="ml-2 text-xs">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            ) : (
              /* Chat Interface */
              <>
                {/* Chat Header */}
                <div className="p-3 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={selectedChat.user.avatar} />
                          <AvatarFallback>
                            {selectedChat.user.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        {isUserOnline(selectedChat.user._id) && (
                          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {selectedChat.user.alias || selectedChat.user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isUserOnline(selectedChat.user._id)
                            ? "Online"
                            : "Offline"}
                          {isUserTyping(selectedChat.user._id) &&
                            " • typing..."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setSelectedChat(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                      No messages yet. Start a conversation!
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${
                          msg.sender === user._id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg ${
                            msg.sender === user._id
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <div className="flex items-center justify-end space-x-1 mt-1">
                            <span className="text-xs opacity-70">
                              {formatTime(msg.createdAt)}
                            </span>
                            {getMessageStatus(msg)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-3 border-t bg-white">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={handleTyping}
                      onKeyPress={handleKeyPress}
                      disabled={sending}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={handleSendMessage}
                      disabled={!message.trim() || sending}
                    >
                      {sending ? (
                        <Clock className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default RealTimeMessenger;
