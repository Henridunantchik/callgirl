import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { FirebasePremiumAvatar } from "../../components/firebase";
import {
  canSendPhotos,
  canReceivePhotos,
  canShowPhotoUpload,
  canDisplayPhotos,
  getPhotoRestrictionMessage,
  getPhotoUpgradePrompt,
} from "../../utils/chatPermissions";
import {
  MessageCircle,
  Send,
  User,
  Clock,
  Check,
  CheckCheck,
  Phone,
  Video,
  MoreVertical,
  Search,
  Filter,
  Trash2,
  Reply,
  Image as ImageIcon,
  Paperclip,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { showToast } from "../../helpers/showToast";
import { messageAPI, userAPI } from "../../services/api";
import { useSocket } from "../../contexts/SocketContext";
import { hasPremiumAccess } from "../../utils/escortAccess";

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { countryCode } = useParams();
  const {
    socket,
    isConnected,
    sendMessage: socketSendMessage,
    startTyping,
    stopTyping,
    markMessageAsRead,
    isUserOnline: socketIsUserOnline,
    isUserTyping,
  } = useSocket();

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

  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);

  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-resize textarea based on content
  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea when message changes
  useEffect(() => {
    autoResizeTextarea();
  }, [message]);

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Handle admin parameter from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const adminId = searchParams.get("admin");

    if (adminId && conversations.length > 0) {
      // Find admin conversation
      let adminConversation = conversations.find(
        (conv) => conv.user._id === adminId
      );

      if (adminConversation) {
        setSelectedChat(adminConversation);
        fetchMessages(adminId);
      } else {
        // Create a virtual admin conversation if it doesn't exist
        const createAdminConversation = async () => {
          try {
            // Get admin details
            const adminResponse = await userAPI.getMainAdmin();
            const admin = adminResponse.data.data.admin;

            // Create virtual conversation object
            const virtualAdminConversation = {
              user: admin,
              lastMessage: null,
              unreadCount: 0,
              _id: `admin_${adminId}`,
              isVirtual: true,
            };

            setSelectedChat(virtualAdminConversation);
            setMessages([]); // Start with empty messages
          } catch (error) {
            console.error("Error creating admin conversation:", error);
            showToast("error", "Failed to open admin conversation");
          }
        };

        createAdminConversation();
      }
    }
  }, [conversations, location.search]);

  // Fetch messages when selected chat changes
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.user._id);
    }
  }, [selectedChat]);

  // Socket event listeners for real-time messaging
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    const handleNewMessage = (data) => {
      const { message } = data;

      // Add to messages if it's for the current chat
      if (
        selectedChat &&
        (message.sender === selectedChat.user._id ||
          message.recipient === selectedChat.user._id)
      ) {
        setMessages((prev) => {
          // Check if this is a response to our temporary message
          const tempMessageIndex = prev.findIndex(
            (msg) =>
              msg.isTemp &&
              msg.content === message.content &&
              msg.sender === message.sender &&
              msg.recipient === message.recipient
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
        if (message.recipient === user._id) {
          markMessageAsRead(message._id);
        }
      }

      // Update conversation list (always update, not just for current chat)
      setConversations((prev) =>
        prev.map((conv) =>
          conv.user._id === message.sender ||
          conv.user._id === message.recipient
            ? {
                ...conv,
                lastMessage: message,
                unreadCount:
                  message.recipient === user._id
                    ? conv.unreadCount + 1
                    : conv.unreadCount,
              }
            : conv
        )
      );

      // Trigger global notification update if we received a new message
      if (message.recipient === user._id) {
        // Dispatch custom event to update notifications in sidebar and topbar
        window.dispatchEvent(
          new CustomEvent("newMessageReceived", {
            detail: { message, senderId: message.sender },
          })
        );
      }
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
    try {
      setLoading(true);
      console.log("📞 Client fetching conversations...");
      // Short timeout and no batching for snappy UX
      const response = await messageAPI.getUserConversations({
        timeout: 1200,
        batch: false,
      });
      console.log("📞 Client Conversations API Response:", response);

      if (response.data && response.data.data) {
        setConversations(response.data.data);
        console.log(
          "📞 Client Conversations loaded:",
          response.data.data.length
        );
        // Auto-select first conversation if none selected
        if (response.data.data.length > 0 && !selectedChat) {
          setSelectedChat(response.data.data[0]);
        }
      } else if (response.data && Array.isArray(response.data)) {
        // Handle different response structure
        setConversations(response.data);
        console.log(
          "📞 Client Conversations loaded (direct array):",
          response.data.length
        );
        // Auto-select first conversation if none selected
        if (response.data.length > 0 && !selectedChat) {
          setSelectedChat(response.data[0]);
        }
      } else {
        console.log("📞 Client No conversations data in response");
        setConversations([]);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });

      // Don't show error toast for 404 (no conversations yet) or 401/403 (auth issues)
      if (
        error.response?.status !== 404 &&
        error.response?.status !== 401 &&
        error.response?.status !== 403
      ) {
        showToast("error", "Failed to load conversations");
      } else if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        console.log("Authentication error - user may need to login");
      }
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (escortId) => {
    try {
      console.log("📨 Fetching messages for escort:", escortId);
      const response = await messageAPI.getConversation(escortId, 1, {
        timeout: 1200,
        batch: false,
      });
      console.log("📨 Messages API Response:", response);

      if (response.data && response.data.data) {
        setMessages(response.data.data.messages || []);
        console.log(
          "📨 Messages loaded:",
          response.data.data.messages?.length || 0
        );

        // Mark all messages as read when conversation is opened
        await markAllMessagesAsRead(escortId);

        // Trigger notification update for Topbar and Sidebar
        window.dispatchEvent(
          new CustomEvent("conversationOpened", {
            detail: { escortId },
          })
        );
      } else if (response.data && Array.isArray(response.data)) {
        // Handle different response structure
        setMessages(response.data);
        console.log("📨 Messages loaded (direct array):", response.data.length);
      } else {
        console.log("📨 No messages data in response");
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });

      // Don't show error toast for 404 (no messages yet) or 401/403 (auth issues)
      if (
        error.response?.status !== 404 &&
        error.response?.status !== 401 &&
        error.response?.status !== 403
      ) {
        showToast("error", "Failed to load messages");
      } else if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        console.log("Authentication error - user may need to login");
      }
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (
      (!message.trim() && !selectedImage) ||
      !selectedChat ||
      sending ||
      !user ||
      !user._id
    )
      return;

    const messageContent = message.trim();
    const recipientId = selectedChat.user._id;

    // Handle image upload if selected
    let imageUrl = null;
    if (selectedImage) {
      try {
        const formData = new FormData();
        formData.append("image", selectedImage);

        // Upload image using the centralized API service
        console.log("🔍 DEBUG - Starting image upload...");
        console.log("🔍 DEBUG - FormData contents:");
        for (let [key, value] of formData.entries()) {
          console.log(`  ${key}:`, value);
        }

        const token = localStorage.getItem("token");
        console.log("🔍 DEBUG - Token exists:", !!token);
        console.log(
          "🔍 DEBUG - Token preview:",
          token ? token.substring(0, 50) + "..." : "null"
        );

        // Use the centralized API service for upload
        console.log("🔍 DEBUG - Using messageAPI.uploadImage...");
        const uploadResponse = await messageAPI.uploadImage(formData);
        console.log("🔍 DEBUG - Upload response:", uploadResponse);

        // Extract URL from response - handle different response structures
        if (uploadResponse.data?.data?.url) {
          imageUrl = uploadResponse.data.data.url;
        } else if (uploadResponse.data?.url) {
          imageUrl = uploadResponse.data.url;
        } else if (typeof uploadResponse.data === "string") {
          imageUrl = uploadResponse.data;
        } else {
          console.error(
            "🔍 DEBUG - Unexpected upload response structure:",
            uploadResponse
          );
          throw new Error("Invalid upload response");
        }

        console.log("🔍 DEBUG - Extracted imageUrl:", imageUrl);
      } catch (error) {
        console.error("Image upload error:", error);
        showToast("error", "Failed to upload image");
        return;
      }
    }

    // Create temporary message for instant feedback
    const tempMessage = {
      _id: `temp_${Date.now()}_${Math.random()}`,
      sender: {
        _id: user._id,
        name: user.name,
        alias: user.alias,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        subscriptionTier: user.subscriptionTier,
        isVerified: user.isVerified,
      },
      recipient: recipientId,
      content: imageUrl || messageContent,
      type: imageUrl ? "image" : "text",
      isRead: false,
      createdAt: new Date().toISOString(),
      isTemp: true,
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
      // Send via socket in the background (non-blocking)
      socketSendMessage(recipientId, messageContent).catch((error) => {
        // Mark message as failed
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempMessage._id ? { ...msg, isFailed: true } : msg
          )
        );
        showToast("error", "Message failed to send");
      });

      // Also send via API for persistence (non-blocking)
      const messageData = {
        escortId: recipientId,
        content: imageUrl || messageContent,
        type: imageUrl ? "image" : "text",
      };
      messageAPI.sendMessage(messageData).catch((error) => {
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
      // Clear selected image and reset textarea height after sending
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        showToast("error", "Please select an image file");
      }
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);

    // Handle typing indicators
    if (!isTyping) {
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
      stopTyping(selectedChat?.user._id);
    }, 1000);
  };

  const markAsRead = async (messageId) => {
    try {
      await messageAPI.markAsRead(messageId);
      // Update message read status locally
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  };

  // Function to mark all messages as read for a conversation
  const markAllMessagesAsRead = async (escortId) => {
    try {
      console.log("📨 Marking conversation as read for escort:", escortId);

      // Use the new API to mark all messages in conversation as read
      const response = await messageAPI.markConversationAsRead(escortId);

      if (response.data && response.data.success) {
        console.log(
          "📨 Conversation marked as read:",
          response.data.data.count,
          "messages"
        );

        // Update messages locally
        setMessages((prev) =>
          prev.map((msg) =>
            !msg.isRead &&
            (msg.sender === escortId ||
              (msg.sender && msg.sender._id === escortId))
              ? { ...msg, isRead: true }
              : msg
          )
        );

        // Update conversation unread count locally
        setConversations((prev) =>
          prev.map((conv) =>
            conv.user._id === escortId ? { ...conv, unreadCount: 0 } : conv
          )
        );

        // Trigger notification update
        console.log("📨 Dispatching messagesRead event");
        window.dispatchEvent(new CustomEvent("messagesRead"));
      } else {
        console.log("📨 No unread messages to mark");
      }
    } catch (error) {
      console.error("📨 Failed to mark conversation as read:", error);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await messageAPI.deleteMessage(messageId);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      showToast("success", "Message deleted");
    } catch (error) {
      console.error("Failed to delete message:", error);
      showToast("error", "Failed to delete message");
    }
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

  // Sort conversations by most recent message first
  const sortedConversations = conversations.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt
      ? new Date(a.lastMessage.createdAt)
      : new Date(0);
    const bTime = b.lastMessage?.createdAt
      ? new Date(b.lastMessage.createdAt)
      : new Date(0);
    return bTime - aTime; // Most recent first
  });

  const filteredConversations = sortedConversations.filter(
    (conv) =>
      conv.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.user.alias?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Messages - Call Girls</title>
        <meta
          name="description"
          content={`Chat with ${
            user?.role === "escort" ? "clients" : "escorts"
          } and manage your conversations.`}
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <MessageCircle className="w-8 h-8 text-blue-600" />
                Messages
              </h1>
              <p className="text-gray-600 ml-11">
                Chat with {user?.role === "escort" ? "clients" : "escorts"} and
                manage your conversations
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isConnected && (
                <Badge variant="destructive" className="text-xs">
                  Offline
                </Badge>
              )}
              {isConnected && (
                <Badge className="bg-green-500 text-white text-xs">
                  <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                  Connected
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          style={{ height: "calc(100vh - 200px)" }}
        >
          {/* Chat List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Conversations ({conversations.length})
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchConversations}
                  disabled={loading}
                  className="h-8"
                >
                  {loading ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    "Refresh"
                  )}
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>

            <CardContent className="p-0 h-full flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchTerm
                      ? "No conversations found"
                      : "No conversations yet"}
                    {!searchTerm && (
                      <div className="mt-2 text-xs text-gray-400">
                        <p>Debug: Loading={loading.toString()}</p>
                        <p>Debug: Conversations={conversations.length}</p>
                        <p>Debug: User ID={user?._id || "No user"}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.user._id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 border-l-4 conversation-item ${
                        selectedChat?.user._id === conversation.user._id
                          ? "bg-blue-50 border-l-blue-500 shadow-sm"
                          : "border-l-transparent hover:border-l-gray-300"
                      }`}
                      onClick={() => setSelectedChat(conversation)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <FirebasePremiumAvatar
                            src={conversation.user.avatar}
                            alt={
                              conversation.user.name || conversation.user.alias
                            }
                            size="h-10 w-10"
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
                            <h3 className="font-medium text-gray-900 truncate">
                              {conversation.user.name ||
                                conversation.user.alias}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {conversation.lastMessage &&
                                formatTime(conversation.lastMessage.createdAt)}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage?.type === "image"
                              ? "📷 Image"
                              : conversation.lastMessage?.content ||
                                "No messages yet"}
                          </p>
                        </div>

                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <div className="lg:col-span-2 h-full">
            <Card className="h-full flex flex-col">
              {selectedChat ? (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FirebasePremiumAvatar
                          src={selectedChat.user.avatar}
                          alt={
                            selectedChat.user.name || selectedChat.user.alias
                          }
                          size="h-8 w-8"
                          showBadge={false}
                          subscriptionTier={selectedChat.user.subscriptionTier}
                          isVerified={selectedChat.user.isVerified}
                        />
                        <div>
                          <span className="font-medium">
                            {selectedChat.user.name || selectedChat.user.alias}
                          </span>
                          <div className="flex items-center gap-2">
                            {isUserOnline(selectedChat.user._id) ? (
                              <Badge className="bg-green-500 text-white text-xs">
                                <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                                Online
                              </Badge>
                            ) : (
                              <span className="text-xs text-gray-500">
                                Offline
                              </span>
                            )}
                            {isUserTyping(selectedChat.user._id) && (
                              <span className="text-xs text-gray-500 italic">
                                typing...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(
                              `/${countryCode}/escort/${
                                selectedChat.user.alias || selectedChat.user._id
                              }`
                            )
                          }
                        >
                          <User className="h-4 w-4" />
                        </Button>
                        {/* Only show phone and video call icons for featured/premium escorts */}
                        {selectedChat?.user?.role === "escort" &&
                          hasPremiumAccess(selectedChat.user) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
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
                                <Phone className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
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
                                <Video className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                      </div>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col p-0">
                    {/* Messages */}
                    <div
                      className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                      style={{ maxHeight: "calc(100vh - 400px)" }}
                    >
                      {messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        messages.map((msg) => {
                          // Check if sender is admin
                          const isAdmin =
                            msg.sender.role === "admin" ||
                            msg.sender.email ===
                              "congogenocidememorial@gmail.com";
                          const isMyMessage = msg.sender._id === user?._id;

                          return (
                            <div
                              key={msg._id}
                              className={`flex ${
                                isMyMessage ? "justify-end" : "justify-start"
                              } mb-4`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md ${
                                  isMyMessage ? "ml-auto" : "mr-auto"
                                }`}
                              >
                                {/* Show sender name for incoming messages */}
                                {!isMyMessage && (
                                  <div className="mb-1">
                                    <span
                                      className={`text-sm font-medium ${
                                        isAdmin
                                          ? "text-purple-600"
                                          : "text-blue-600"
                                      }`}
                                    >
                                      {msg.sender?.name ||
                                        msg.sender?.alias ||
                                        (msg.sender?.email
                                          ? msg.sender.email.split("@")[0]
                                          : "Unknown")}
                                    </span>
                                  </div>
                                )}
                                <div
                                  className={`px-4 py-3 rounded-2xl shadow-sm message-bubble ${
                                    isMyMessage
                                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                                      : isAdmin
                                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-bl-md"
                                      : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 rounded-bl-md border border-gray-200"
                                  }`}
                                >
                                  {/* Check if message type is image */}
                                  {msg.type === "image" ? (
                                    canDisplayPhotos(user, msg.sender) ? (
                                      <div className="space-y-2">
                                        <img
                                          src={msg.content}
                                          alt="Message image"
                                          className="max-w-full max-h-64 rounded-lg object-cover"
                                          onError={(e) => {
                                            // If image fails to load, show as text
                                            e.target.style.display = "none";
                                            const textDiv =
                                              document.createElement("div");
                                            textDiv.className =
                                              "text-sm leading-relaxed";
                                            textDiv.textContent = msg.content;
                                            e.target.parentNode.appendChild(
                                              textDiv
                                            );
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-3 text-center">
                                          <ImageIcon className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                                          <p className="text-sm text-orange-700 font-medium">
                                            Photo Message
                                          </p>
                                          <p className="text-xs text-orange-600">
                                            Upgrade to Premium to view photos
                                          </p>
                                        </div>
                                      </div>
                                    )
                                  ) : (
                                    <p className="text-sm leading-relaxed">
                                      {msg.content}
                                    </p>
                                  )}
                                  <div
                                    className={`flex items-center gap-1 mt-2 text-xs ${
                                      isMyMessage
                                        ? "text-blue-100 opacity-80"
                                        : isAdmin
                                        ? "text-purple-100 opacity-80"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    <span>{formatTime(msg.createdAt)}</span>
                                    {isMyMessage && (
                                      <>
                                        {msg.isRead ? (
                                          <CheckCheck className="w-3 h-3 text-blue-200" />
                                        ) : (
                                          <Check className="w-3 h-3 text-blue-200" />
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Message actions */}
                                <div
                                  className={`flex items-center gap-1 mt-2 ${
                                    isMyMessage
                                      ? "justify-end"
                                      : "justify-start"
                                  }`}
                                >
                                  {isMyMessage && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2 text-xs hover:bg-blue-50 text-gray-500 hover:text-gray-700"
                                      onClick={() => deleteMessage(msg._id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                                  >
                                    <Reply className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t bg-gray-50 flex-shrink-0">
                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="mb-3 relative">
                          <div className="relative inline-block">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="max-h-32 rounded-lg border"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                              onClick={removeSelectedImage}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 items-center">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        {(() => {
                          const canUpload = canShowPhotoUpload(
                            user,
                            selectedChat?.user
                          );
                          console.log("🔍 Photo upload check:", {
                            user: user,
                            recipient: selectedChat?.user,
                            canUpload: canUpload,
                            userRole: user?.role,
                            userTier: user?.subscriptionTier,
                            recipientRole: selectedChat?.user?.role,
                          });
                          return canUpload;
                        })() ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-gray-200"
                            onClick={() => fileInputRef.current?.click()}
                            title="Send photo"
                          >
                            <ImageIcon className="h-4 w-4 text-gray-600" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-gray-200 opacity-50 cursor-not-allowed"
                            disabled
                            title={getPhotoRestrictionMessage(
                              user,
                              selectedChat?.user
                            )}
                          >
                            <ImageIcon className="h-4 w-4 text-gray-400" />
                          </Button>
                        )}
                        <Textarea
                          ref={textareaRef}
                          value={message}
                          onChange={handleTyping}
                          placeholder="Type your message..."
                          onKeyPress={handleKeyPress}
                          className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none min-h-[40px] max-h-[120px] overflow-y-auto"
                          disabled={sending}
                          rows={1}
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={
                            (!message.trim() && !selectedImage) || sending
                          }
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          {sending ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">
                      Select a conversation
                    </h3>
                    <p>
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Messages;
