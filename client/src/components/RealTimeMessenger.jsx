import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";
import { useParams } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FirebasePremiumAvatar } from "./firebase";
import FirebaseImageDisplay from "./FirebaseImageDisplay";
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
  RefreshCw,
} from "lucide-react";
import { showToast } from "../helpers/showToast";
import { messageAPI } from "../services/api";
import { hasPremiumAccess } from "../utils/escortAccess";

const RealTimeMessenger = ({ isOpen, onClose, selectedEscort = null }) => {
  const { user } = useAuth();
  const { countryCode } = useParams();

  // Add safety check for socket context
  let socketContext = null;
  try {
    socketContext = useSocket();
  } catch (error) {
    console.warn("Socket context not available:", error.message);
    // Return null if socket context is not available
    if (!isOpen) return null;
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-red-500 text-white p-4 rounded-lg">
          Messenger temporarily unavailable
        </div>
      </div>
    );
  }

  const {
    socket,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    markMessageAsRead,
    isUserOnline: socketIsUserOnline,
    isUserTyping,
  } = socketContext;

  // Helper function to check if user is online using both socket and API data
  const isUserOnline = (userId) => {
    // First check socket-based online status (real-time)
    if (socketIsUserOnline(userId)) {
      return true;
    }

    // Then check if the user object has isOnline field from API
    const conversation = conversations.find((conv) => conv.user._id === userId);
    if (conversation?.user?.isOnline) {
      return true;
    }

    // Also check selectedChat user if it's the same user
    if (selectedChat?.user?._id === userId && selectedChat?.user?.isOnline) {
      return true;
    }

    return false;
  };

  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // Fetch conversations on mount and when messenger opens
  useEffect(() => {
    const userId = user?._id || user?.user?._id || user?.id || user?.user?.id;
    if (isOpen && user && userId) {
      console.log("🔄 Fetching conversations...");
      fetchConversations();
    }
  }, [isOpen, user]);

  // Fetch messages when selected chat changes
  useEffect(() => {
    const userId = user?._id || user?.user?._id || user?.id || user?.user?.id;
    if (selectedChat && user && userId) {
      fetchMessages(selectedChat.user._id);
    }
  }, [selectedChat, user]);

  // Socket event listeners
  useEffect(() => {
    const userId = user?._id || user?.user?._id || user?.id || user?.user?.id;
    if (!socket || !user || !userId) return;

    // Listen for new messages
    const handleNewMessage = (data) => {
      const { message } = data;

      // Add to messages if it's for the current chat
      if (
        selectedChat &&
        (message.sender === selectedChat.user._id ||
          (message.sender && message.sender._id === selectedChat.user._id) ||
          message.recipient === selectedChat.user._id ||
          (message.recipient &&
            message.recipient._id === selectedChat.user._id))
      ) {
        setMessages((prev) => {
          // Check if this is a response to our temporary message
          const tempMessageIndex = prev.findIndex(
            (msg) =>
              msg.isTemp &&
              msg.content === message.content &&
              (msg.sender === message.sender ||
                (msg.sender &&
                  message.sender &&
                  msg.sender._id === message.sender._id)) &&
              (msg.recipient === message.recipient ||
                (msg.recipient &&
                  message.recipient &&
                  msg.recipient._id === message.recipient._id))
          );

          if (tempMessageIndex !== -1) {
            // Replace temporary message with real message
            const newMessages = [...prev];
            newMessages[tempMessageIndex] = message;
            return newMessages;
          } else {
            // Add new message
            return [...prev, message];
          }
        });

        // Mark as read if we're the recipient
        if (
          message.recipient === user._id ||
          (message.recipient && message.recipient._id === user._id)
        ) {
          markMessageAsRead(message._id);
        }
      }

      // Update conversation list (always update, not just for current chat)
      setConversations((prev) =>
        prev.map((conv) =>
          conv.user._id === message.sender ||
          (message.sender && message.sender._id === conv.user._id) ||
          conv.user._id === message.recipient ||
          (message.recipient && message.recipient._id === conv.user._id)
            ? {
                ...conv,
                lastMessage: message,
                unreadCount:
                  message.recipient === user._id ||
                  (message.recipient && message.recipient._id === user._id)
                    ? conv.unreadCount + 1
                    : conv.unreadCount,
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
      console.log("📞 Calling getUserConversations API...");
      const response = await messageAPI.getUserConversations();
      console.log("📞 API Response:", response);

      if (response.data && response.data.data) {
        console.log("📞 Setting conversations:", response.data.data);
        setConversations(response.data.data);

        // Auto-select first conversation if none selected
        if (response.data.data.length > 0 && !selectedChat) {
          setSelectedChat(response.data.data[0]);
        }
      } else {
        console.log("📞 No conversations data in response");
        setConversations([]);
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
    const userId = user?._id || user?.user?._id || user?.id || user?.user?.id;
    if (!user || !userId) {
      console.log("Skipping fetchMessages - user not authenticated");
      return;
    }

    try {
      const response = await messageAPI.getConversation(escortId);

      if (response.data && response.data.data) {
        setMessages(response.data.data.messages || []);

        // Mark all messages as read using the new API
        try {
          await messageAPI.markConversationAsRead(escortId);
          console.log("📨 Messages marked as read for conversation:", escortId);

          // Trigger notification update
          window.dispatchEvent(new CustomEvent("messagesRead"));
        } catch (error) {
          console.error("Failed to mark messages as read:", error);
        }
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      showToast("error", "Failed to load messages");
    }
  };

  const handleSendMessage = async () => {
    // Get user ID from multiple possible sources
    const userId = user?._id || user?.user?._id || user?.id || user?.user?.id;

    if (
      (!message.trim() && !selectedImage) ||
      !selectedChat ||
      sending ||
      !user ||
      !userId
    ) {
      console.log("Cannot send message - missing data:", {
        message: !!message.trim(),
        selectedImage: !!selectedImage,
        selectedChat: !!selectedChat,
        sending,
        user: !!user,
        userId,
      });
      return;
    }

    // If there's a selected image, send it first
    if (selectedImage) {
      await handleSendImage();
      return;
    }

    const messageContent = message.trim();
    const recipientId = selectedChat.user._id;

    console.log("📤 Sending message:", {
      content: messageContent,
      recipientId,
      senderId: userId,
    });

    // Create temporary message for instant feedback
    const tempMessage = {
      _id: `temp_${Date.now()}_${Math.random()}`,
      sender: userId,
      recipient: recipientId,
      content: messageContent,
      type: "text",
      isRead: false,
      createdAt: new Date().toISOString(),
      isTemp: true, // Mark as temporary
    };

    // Update UI immediately for instant feedback
    setMessages((prev) => [...prev, tempMessage]);
    setMessage("");
    setSending(true);

    // Update conversation list immediately
    setConversations((prev) =>
      prev.map((conv) =>
        conv.user._id === recipientId
          ? { ...conv, lastMessage: tempMessage }
          : conv
      )
    );

    try {
      console.log("📤 Sending via socket...");
      // Send via socket in the background (non-blocking)
      sendMessage(recipientId, messageContent).catch((error) => {
        console.error("Socket send failed:", error);
        // Mark message as failed
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempMessage._id ? { ...msg, isFailed: true } : msg
          )
        );
        showToast("error", "Message failed to send");
      });

      console.log("📤 Sending via API...");
      // Also send via API for persistence (non-blocking)
      messageAPI
        .sendMessage({
          escortId: recipientId,
          content: messageContent,
          type: "text",
        })
        .catch((error) => {
          console.error("API send failed:", error);
          // Don't show error to user if socket worked
        });
    } catch (error) {
      console.error("Failed to send message:", error);
      // Mark message as failed
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempMessage._id ? { ...msg, isFailed: true } : msg
        )
      );
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

  const retryMessage = async (failedMessage) => {
    try {
      // Remove the failed message
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== failedMessage._id)
      );

      // Send the message again
      const messageContent = failedMessage.content;
      const recipientId = failedMessage.recipient;

      // Create new temporary message
      const tempMessage = {
        _id: `temp_${Date.now()}_${Math.random()}`,
        sender: user._id,
        recipient: recipientId,
        content: messageContent,
        type: "text",
        isRead: false,
        createdAt: new Date().toISOString(),
        isTemp: true,
      };

      // Add to messages
      setMessages((prev) => [...prev, tempMessage]);

      // Send via socket
      sendMessage(recipientId, messageContent).catch((error) => {
        console.error("Retry socket send failed:", error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempMessage._id ? { ...msg, isFailed: true } : msg
          )
        );
        showToast("error", "Message failed to send");
      });

      // Send via API
      messageAPI
        .sendMessage({
          escortId: recipientId,
          content: messageContent,
          type: "text",
        })
        .catch((error) => {
          console.error("Retry API send failed:", error);
        });
    } catch (error) {
      console.error("Retry failed:", error);
      showToast("error", "Failed to retry message");
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        showToast("error", "Image size must be less than 5MB");
        return;
      }
      setSelectedImage(file);
    }
  };

  const handleSendImage = async () => {
    if (!selectedImage || !selectedChat || uploadingImage) return;

    const userId = user?._id || user?.user?._id || user?.id || user?.user?.id;
    const recipientId = selectedChat.user._id;

    setUploadingImage(true);

    try {
      // Upload image first
      const formData = new FormData();
      formData.append("image", selectedImage);

      // Use the centralized API service for upload
      const uploadResponse = await messageAPI.uploadImage(formData);

      // Extract URL from response - handle different response structures
      let imageUrl;
      if (uploadResponse.data?.data?.url) {
        imageUrl = uploadResponse.data.data.url;
      } else if (uploadResponse.data?.url) {
        imageUrl = uploadResponse.data.url;
      } else if (typeof uploadResponse.data === "string") {
        imageUrl = uploadResponse.data;
      } else {
        console.error("Unexpected upload response structure:", uploadResponse);
        throw new Error("Invalid upload response");
      }

      // Create temporary message
      const tempMessage = {
        _id: `temp_${Date.now()}_${Math.random()}`,
        sender: userId,
        recipient: recipientId,
        content: imageUrl,
        type: "image",
        isRead: false,
        createdAt: new Date().toISOString(),
        isTemp: true,
      };

      // Update UI immediately
      setMessages((prev) => [...prev, tempMessage]);
      setSelectedImage(null);

      // Send via API
      await messageAPI.sendMessage({
        escortId: recipientId,
        content: imageUrl,
        type: "image",
      });

      // Send via socket
      sendMessage(recipientId, imageUrl).catch((error) => {
        console.error("Socket send failed:", error);
      });
    } catch (error) {
      console.error("Failed to send image:", error);
      showToast("error", "Failed to send image");
    } finally {
      setUploadingImage(false);
    }
  };

  const getMessageStatus = (message) => {
    if (!user || !user._id) return null;

    if (
      message.sender === user._id ||
      (message.sender && message.sender._id === user._id)
    ) {
      if (message.isFailed) {
        return <X className="w-3 h-3 text-red-500" />;
      } else if (message.isRead) {
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
                    onClick={() =>
                      (window.location.href = `/${countryCode}/signin`)
                    }
                    className="w-full"
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            ) : !selectedChat ? (
              <div className="flex-1 overflow-y-auto flex flex-col">
                <div className="p-3 border-b flex-shrink-0">
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

                <div
                  className="flex-1 overflow-y-auto"
                  style={{ maxHeight: "200px" }}
                >
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
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b transition-all duration-200 hover:shadow-sm"
                          onClick={() => setSelectedChat(conversation)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <FirebasePremiumAvatar
                                src={conversation.user.avatar}
                                alt={
                                  conversation.user.alias ||
                                  conversation.user.name
                                }
                                size="w-10 h-10"
                                showBadge={false}
                                subscriptionTier={
                                  conversation.user.subscriptionTier
                                }
                                isVerified={conversation.user.isVerified}
                              />
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
                        <FirebasePremiumAvatar
                          src={selectedChat.user.avatar}
                          alt={
                            selectedChat.user.alias || selectedChat.user.name
                          }
                          size="w-8 h-8"
                          showBadge={false}
                          subscriptionTier={selectedChat.user.subscriptionTier}
                          isVerified={selectedChat.user.isVerified}
                        />
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
                      {/* Only show phone and video call icons for featured/premium escorts */}
                      {selectedChat?.user?.role === "escort" &&
                        hasPremiumAccess(selectedChat.user) && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                if (selectedChat.user.phone) {
                                  window.open(
                                    `tel:${selectedChat.user.phone}`,
                                    "_blank"
                                  );
                                } else {
                                  showToast(
                                    "error",
                                    "Phone number not available"
                                  );
                                }
                              }}
                              title="Call escort"
                            >
                              <Phone className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                if (selectedChat.user.phone) {
                                  // Open WhatsApp with video call intent
                                  const whatsappUrl = `https://wa.me/${selectedChat.user.phone.replace(
                                    /\D/g,
                                    ""
                                  )}?text=Hi, I'd like to video call you`;
                                  window.open(whatsappUrl, "_blank");
                                } else {
                                  showToast(
                                    "error",
                                    "Phone number not available"
                                  );
                                }
                              }}
                              title="Video call via WhatsApp"
                            >
                              <Video className="w-4 h-4" />
                            </Button>
                          </>
                        )}
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
                <div
                  className="flex-1 overflow-y-auto p-3 space-y-2"
                  style={{ maxHeight: "200px" }}
                >
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                      No messages yet. Start a conversation!
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${
                          user &&
                          user._id &&
                          (msg.sender === user._id ||
                            (msg.sender && msg.sender._id === user._id))
                            ? "justify-end"
                            : "justify-start"
                        } mb-3`}
                      >
                        <div
                          className={`max-w-xs ${
                            user &&
                            user._id &&
                            (msg.sender === user._id ||
                              (msg.sender && msg.sender._id === user._id))
                              ? "ml-auto"
                              : "mr-auto"
                          }`}
                        >
                          <div
                            className={`px-3 py-2 rounded-2xl shadow-sm message-bubble ${
                              user &&
                              user._id &&
                              (msg.sender === user._id ||
                                (msg.sender && msg.sender._id === user._id))
                                ? msg.isFailed
                                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white rounded-br-md"
                                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                                : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 rounded-bl-md border border-gray-200"
                            }`}
                          >
                            {/* Check if message type is image */}
                            {msg.type === "image" ? (
                              <div className="space-y-2">
                                <FirebaseImageDisplay
                                  src={msg.content}
                                  alt="Message image"
                                  className="max-w-full max-h-48 rounded-lg object-cover"
                                />
                              </div>
                            ) : (
                              <p className="text-sm leading-relaxed">
                                {msg.content}
                              </p>
                            )}
                            <div className="flex items-center justify-end space-x-1 mt-1">
                              <span className="text-xs opacity-70">
                                {formatTime(msg.createdAt)}
                              </span>
                              {getMessageStatus(msg)}
                              {msg.isFailed && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 ml-1 hover:bg-red-600"
                                  onClick={() => retryMessage(msg)}
                                >
                                  <RefreshCw className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-3 border-t bg-gray-50 flex-shrink-0">
                  {/* Selected Image Preview */}
                  {selectedImage && (
                    <div className="mb-2 p-2 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <img
                            src={URL.createObjectURL(selectedImage)}
                            alt="Preview"
                            className="w-12 h-12 object-cover rounded"
                          />
                          <span className="text-sm text-gray-600">
                            {selectedImage.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:bg-red-100"
                          onClick={() => setSelectedImage(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-gray-200"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="w-4 h-4 text-gray-600" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={handleTyping}
                      onKeyPress={handleKeyPress}
                      disabled={sending || uploadingImage}
                      className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                      onClick={handleSendMessage}
                      disabled={
                        (!message.trim() && !selectedImage) ||
                        sending ||
                        uploadingImage
                      }
                    >
                      {sending || uploadingImage ? (
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
