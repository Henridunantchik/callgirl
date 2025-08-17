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
  Shield,
  AlertTriangle,
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

        // Update conversation list
        setConversations((prev) =>
          prev.map((conv) =>
            conv.user._id === message.sender || conv.user._id === message.recipient
              ? {
                  ...conv,
                  lastMessage: message,
                  unreadCount:
                    message.sender !== user?.user?._id
                      ? (conv.unreadCount || 0) + 1
                      : conv.unreadCount || 0,
                }
              : conv
          )
        );
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

        if (unreadMessages.length > 0) {
          // Mark messages as read
          unreadMessages.forEach((msg) => {
            messageAPI.markAsRead(msg._id);
          });

          // Update conversation unread count
          setConversations((prev) =>
            prev.map((conv) =>
              conv.user._id === escortId
                ? { ...conv, unreadCount: 0 }
                : conv
            )
          );
        }
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      showToast("error", "Failed to load messages");
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    const messageData = {
      escortId: selectedChat.user._id,
      content: message.trim(),
      type: "text",
    };

    // Add temporary message to UI
    const tempMessage = {
      _id: Date.now(),
      content: message.trim(),
      sender: user?.user?._id,
      recipient: selectedChat.user._id,
      createdAt: new Date().toISOString(),
      isTemp: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setMessage("");

    try {
      setSending(true);
      const response = await messageAPI.sendMessage(messageData);

      if (response.data && response.data.data) {
        // Update conversation list
        setConversations((prev) =>
          prev.map((conv) =>
            conv.user._id === selectedChat.user._id
              ? {
                  ...conv,
                  lastMessage: response.data.data,
                }
              : conv
          )
        );
      }

      // Send via socket for real-time delivery
      if (socket && isConnected) {
        socketSendMessage(response.data.data);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      showToast("error", "Failed to send message");
      // Remove temporary message on error
      setMessages((prev) => prev.filter((msg) => !msg.isTemp));
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

  const filteredConversations = conversations.filter((conv) =>
    conv.user.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    conv.user.email
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="h-full">
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
              <CardContent className="p-0">
                <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
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
                          <Avatar className="w-12 h-12">
                            <AvatarImage
                              src={conversation.user.avatar}
                              alt={conversation.user.name}
                            />
                            <AvatarFallback>
                              {conversation.user.name
                                .charAt(0)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
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
                              {conversation.lastMessage?.content || "Aucun message"}
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
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={selectedChat.user.avatar}
                            alt={selectedChat.user.name}
                          />
                          <AvatarFallback>
                            {selectedChat.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
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
                                <span className="text-xs text-green-600">En ligne</span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">Hors ligne</span>
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
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Aucun message dans cette conversation</p>
                        <p className="text-sm">
                          Commencez à discuter avec {selectedChat.user.name}
                        </p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg._id}
                          className={`flex ${
                            msg.sender === user?.user?._id
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              msg.sender === user?.user?._id
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <div
                              className={`flex items-center justify-between mt-1 text-xs ${
                                msg.sender === user?.user?._id
                                  ? "text-blue-100"
                                  : "text-gray-500"
                              }`}
                            >
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString()}
                              </span>
                              {msg.sender === user?.user?._id && (
                                <div className="flex items-center gap-1">
                                  {msg.isRead ? (
                                    <CheckCheck className="w-3 h-3" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                          <p className="text-sm italic">En train d'écrire...</p>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Tapez votre message..."
                        value={message}
                        onChange={handleTyping}
                        onKeyPress={handleKeyPress}
                        disabled={sending}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || sending}
                        size="sm"
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
