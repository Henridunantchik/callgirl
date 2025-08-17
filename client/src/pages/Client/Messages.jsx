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
import { Badge } from "../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
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
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { showToast } from "../../helpers/showToast";
import { messageAPI } from "../../services/api";
import { useSocket } from "../../contexts/SocketContext";

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    socket,
    isConnected,
    sendMessage: socketSendMessage,
    startTyping,
    stopTyping,
    markMessageAsRead,
    isUserOnline,
    isUserTyping,
  } = useSocket();

  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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
      console.log("📞 Fetching conversations from Messages page...");
      const response = await messageAPI.getUserConversations();
      console.log("📞 Conversations response:", response);

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
    try {
      const response = await messageAPI.getConversation(escortId);
      console.log("Messages:", response.data);

      if (response.data && response.data.data) {
        setMessages(response.data.data.messages || []);

        // Mark messages as read when conversation is opened
        const unreadMessages =
          response.data.data.messages?.filter(
            (msg) =>
              !msg.isRead &&
              (msg.sender === escortId ||
                (msg.sender && msg.sender._id === escortId))
          ) || [];

        // Mark each unread message as read
        unreadMessages.forEach((msg) => {
          markMessageAsRead(msg._id);
        });

        // Update conversation unread count locally
        setConversations((prev) =>
          prev.map((conv) =>
            conv.user._id === escortId ? { ...conv, unreadCount: 0 } : conv
          )
        );
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      showToast("error", "Failed to load messages");
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedChat || sending || !user || !user._id)
      return;

    const messageContent = message.trim();
    const recipientId = selectedChat.user._id;

    console.log("📤 Sending message from Messages page:", {
      content: messageContent,
      recipientId,
      senderId: user._id,
    });

    // Create temporary message for instant feedback
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
      socketSendMessage(recipientId, messageContent).catch((error) => {
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
      messageAPI.sendMessage(recipientId, messageContent).catch((error) => {
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
      sendMessage();
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

  const filteredConversations = conversations.filter(
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
          content={`Chat with ${user?.role === 'escort' ? 'clients' : 'escorts'} and manage your conversations.`}
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
                Chat with escorts and manage your conversations
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
                          <Avatar className="h-10 w-10">
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
                            {conversation.lastMessage?.content ||
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
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={selectedChat.user.avatar} />
                          <AvatarFallback>
                            {selectedChat.user.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
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
                              `/escort/${
                                selectedChat.user.alias || selectedChat.user._id
                              }`
                            )
                          }
                        >
                          <User className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `tel:${selectedChat.user.phone}`,
                              "_self"
                            )
                          }
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
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
                        messages.map((msg) => (
                          <div
                            key={msg._id}
                            className={`flex ${
                              msg.sender._id === user?._id
                                ? "justify-end"
                                : "justify-start"
                            } mb-4`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md ${
                                msg.sender._id === user?._id
                                  ? "ml-auto"
                                  : "mr-auto"
                              }`}
                            >
                              <div
                                className={`px-4 py-3 rounded-2xl shadow-sm message-bubble ${
                                  msg.sender._id === user?._id
                                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                                    : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 rounded-bl-md border border-gray-200"
                                }`}
                              >
                                <p className="text-sm leading-relaxed">
                                  {msg.content}
                                </p>
                                <div
                                  className={`flex items-center gap-1 mt-2 text-xs ${
                                    msg.sender._id === user?._id
                                      ? "text-blue-100 opacity-80"
                                      : "text-gray-500"
                                  }`}
                                >
                                  <span>{formatTime(msg.createdAt)}</span>
                                  {msg.sender._id === user?._id && (
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
                                  msg.sender._id === user?._id
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                {msg.sender._id === user?._id && (
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
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t bg-gray-50 flex-shrink-0">
                      <div className="flex gap-2 items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-gray-200"
                        >
                          <Paperclip className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-gray-200"
                        >
                          <ImageIcon className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Input
                          value={message}
                          onChange={handleTyping}
                          placeholder="Type your message..."
                          onKeyPress={handleKeyPress}
                          className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          disabled={sending}
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={!message.trim() || sending}
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
