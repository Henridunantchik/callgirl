import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
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
import PremiumAvatar from "../../components/PremiumAvatar";
import {
  MessageCircle,
  Send,
  User,
  Clock,
  Check,
  CheckCheck,
  Phone,
  MoreVertical,
  Search,
  Filter,
  Trash2,
  Reply,
  Image as ImageIcon,
  Paperclip,
  Shield,
  AlertTriangle,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { showToast } from "../../helpers/showToast";
import { messageAPI } from "../../services/api";
import { useSocket } from "../../contexts/SocketContext";
import Loading from "../../components/Loading";

const AdminMessages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

        // Update conversation list and maintain sorting
        setConversations((prev) => {
          const updatedConversations = prev.map((conv) =>
            conv.user._id === message.sender ||
            conv.user._id === message.recipient
              ? {
                  ...conv,
                  lastMessage: message,
                  unreadCount:
                    message.sender !== user?.user?._id
                      ? (conv.unreadCount || 0) + 1
                      : conv.unreadCount || 0,
                }
              : conv
          );

          // Sort by last message time (most recent first)
          return updatedConversations.sort((a, b) => {
            const timeA = new Date(a.lastMessage?.createdAt || 0);
            const timeB = new Date(b.lastMessage?.createdAt || 0);
            return timeB - timeA;
          });
        });
      }
    };

    // Listen for typing indicators
    const handleTypingStart = (data) => {
      if (selectedChat && data.userId === selectedChat.user._id) {
        setIsTyping(true);
      }
    };

    const handleTypingStop = (data) => {
      if (selectedChat && data.userId === selectedChat.user._id) {
        setIsTyping(false);
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("typing_start", handleTypingStart);
    socket.on("typing_stop", handleTypingStop);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("typing_start", handleTypingStart);
      socket.off("typing_stop", handleTypingStop);
    };
  }, [socket, selectedChat, user]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getUserConversations();
      console.log("📞 Admin Conversations response:", response);

      if (response.data && response.data.data) {
        // Sort conversations by last message time (most recent first)
        const sortedConversations = response.data.data.sort((a, b) => {
          const timeA = new Date(a.lastMessage?.createdAt || 0);
          const timeB = new Date(b.lastMessage?.createdAt || 0);
          return timeB - timeA; // Most recent first
        });

        setConversations(sortedConversations);
        // Auto-select first conversation if none selected
        if (sortedConversations.length > 0 && !selectedChat) {
          setSelectedChat(sortedConversations[0]);
        }
      } else {
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
    try {
      const response = await messageAPI.getConversation(escortId);
      console.log("Messages:", response.data);

      if (response.data && response.data.data) {
        setMessages(response.data.data.messages || []);

        // Mark all messages as read using the new API
        try {
          await messageAPI.markConversationAsRead(escortId);
          console.log("📨 Messages marked as read for conversation:", escortId);

          // Update conversation unread count
          setConversations((prev) =>
            prev.map((conv) =>
              conv.user._id === escortId ? { ...conv, unreadCount: 0 } : conv
            )
          );

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

  const sendMessage = async () => {
    if (
      (!message.trim() && !selectedImage) ||
      !selectedChat ||
      sending ||
      !user
    )
      return;

    const messageContent = message.trim();
    const recipientId = selectedChat.user._id;
    const senderId = user._id || user.user?._id;

    if (!senderId) {
      console.error("❌ No sender ID found:", user);
      showToast("error", "User authentication error");
      return;
    }

    // Handle image upload if selected
    let imageUrl = null;
    if (selectedImage) {
      try {
        const formData = new FormData();
        formData.append("image", selectedImage);

        // Upload image to server
        const uploadResponse = await fetch(
          `${
            import.meta.env.VITE_API_URL ||
            (window.location.hostname !== "localhost" &&
            window.location.hostname !== "127.0.0.1"
              ? "https://callgirls-api.onrender.com/api"
              : "http://localhost:5000/api")
          }/message/upload-image`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: formData,
          }
        );

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.data?.url || uploadData.url;
        } else {
          const errorText = await uploadResponse.text();
          throw new Error(`Image upload failed: ${uploadResponse.status}`);
        }
      } catch (error) {
        showToast("error", `Failed to upload image: ${error.message}`);
        return;
      }
    }

    // Create temporary message for instant feedback
    const tempMessage = {
      _id: `temp_${Date.now()}_${Math.random()}`,
      sender: {
        _id: senderId,
        name: user.name || user.user?.name,
        alias: user.alias || user.user?.alias,
        email: user.email || user.user?.email,
        role: user.role || user.user?.role,
        avatar: user.avatar || user.user?.avatar,
        subscriptionTier: user.subscriptionTier || user.user?.subscriptionTier,
        isVerified: user.isVerified || user.user?.isVerified,
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
      socketSendMessage(recipientId, imageUrl || messageContent).catch(
        (error) => {
          // Mark message as failed
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === tempMessage._id ? { ...msg, isFailed: true } : msg
            )
          );
          showToast("error", "Message failed to send");
        }
      );

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

    if (socket && isConnected && selectedChat) {
      startTyping(selectedChat.user._id);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(selectedChat.user._id);
      }, 1000);
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <>
      <Helmet>
        <title>Admin Messages - Call Girls</title>
        <meta name="description" content="Admin messaging system" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Messages
          </h1>
          <p className="text-gray-600">
            Gérer les demandes d'upgrade et communiquer avec les escorts
          </p>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          style={{ height: "calc(100vh - 200px)" }}
        >
          {/* Conversations List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Conversations
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher des conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 h-full flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune conversation trouvée</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.user._id}
                      onClick={() => setSelectedChat(conversation)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b ${
                        selectedChat?.user._id === conversation.user._id
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <PremiumAvatar
                          src={conversation.user.avatar}
                          alt={conversation.user.name}
                          size="w-12 h-12"
                          showBadge={false}
                          user={conversation.user}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {conversation.user.name}
                            </h3>
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-red-500 text-white text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage?.type === "image"
                              ? "📷 Image"
                              : conversation.lastMessage?.content ||
                                "No messages yet"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {conversation.lastMessage?.createdAt
                                ? new Date(
                                    conversation.lastMessage.createdAt
                                  ).toLocaleDateString()
                                : ""}
                            </span>
                            {isUserOnline(conversation.user._id) && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <div className="lg:col-span-2 h-full">
            <Card className="h-full flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <PremiumAvatar
                          src={selectedChat.user.avatar}
                          alt={selectedChat.user.name}
                          size="w-10 h-10"
                          showBadge={false}
                          user={selectedChat.user}
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {selectedChat.user.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {selectedChat.user.email}
                            </span>
                            {isUserOnline(selectedChat.user._id) ? (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-green-600">
                                  En ligne
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">
                                Hors ligne
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/ug/admin/upgrade-requests`)}
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Demandes d'Upgrade
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

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
                          (msg.sender && msg.sender.role === "admin") ||
                          (msg.sender &&
                            msg.sender.email ===
                              "congogenocidememorial@gmail.com");
                        const isMyMessage =
                          msg.sender &&
                          (msg.sender._id === user?._id ||
                            msg.sender._id === user?.user?._id);

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
                                {msg.type === "image" ? (
                                  <div className="space-y-2">
                                    <img
                                      src={msg.content}
                                      alt="Message image"
                                      className="max-w-full max-h-64 rounded-lg"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                        e.target.nextSibling.style.display =
                                          "block";
                                      }}
                                    />
                                    <div className="hidden text-xs text-gray-500">
                                      Image failed to load
                                    </div>
                                  </div>
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
                                  <span>
                                    {new Date(
                                      msg.createdAt
                                    ).toLocaleTimeString()}
                                  </span>
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
                            </div>
                          </div>
                        );
                      })
                    )}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                          <p className="text-sm italic">typing...</p>
                        </div>
                      </div>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-gray-200"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImageIcon className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
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
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">
                      Sélectionnez une conversation
                    </h3>
                    <p>Choisissez une conversation pour commencer à discuter</p>
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

export default AdminMessages;
