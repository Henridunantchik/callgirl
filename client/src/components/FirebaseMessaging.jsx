import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Paperclip,
  Image,
  Video,
  File,
  MoreVertical,
  Trash2,
  X,
} from "lucide-react";
import firebaseMessaging from "../services/firebaseMessaging";
import firebaseStorage from "../services/firebaseStorage";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const FirebaseMessaging = ({
  currentUserId,
  otherUserId,
  otherUserName,
  otherUserAvatar,
  onMessageSent,
  className = "",
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll automatique vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialiser ou récupérer la conversation
  useEffect(() => {
    if (!currentUserId || !otherUserId) return;

    const initializeConversation = async () => {
      setLoading(true);
      try {
        // Vérifier si une conversation existe déjà
        const conversations = await firebaseMessaging.getUserConversations(
          currentUserId
        );

        if (conversations.success) {
          const existingConversation = conversations.conversations.find(
            (conv) => conv.participants.includes(otherUserId)
          );

          if (existingConversation) {
            setConversationId(existingConversation.id);
            await loadMessages(existingConversation.id);
          } else {
            // Créer une nouvelle conversation
            const result = await firebaseMessaging.createConversation([
              currentUserId,
              otherUserId,
            ]);
            if (result.success) {
              setConversationId(result.conversationId);
            }
          }
        }
      } catch (error) {
        console.error("Erreur initialisation conversation:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeConversation();
  }, [currentUserId, otherUserId]);

  // Écouter les nouveaux messages
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = firebaseMessaging.listenToConversation(
      conversationId,
      (newMessages) => {
        setMessages(newMessages);
      }
    );

    return () => unsubscribe();
  }, [conversationId]);

  const loadMessages = async (convId) => {
    try {
      const result = await firebaseMessaging.getConversationMessages(
        convId,
        50
      );
      if (result.success) {
        setMessages(result.messages);
      }
    } catch (error) {
      console.error("Erreur chargement messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    if (!conversationId) return;

    try {
      const messageData = {
        senderId: currentUserId,
        content: newMessage.trim(),
        type: "text",
        attachments: [],
      };

      // Upload des pièces jointes si présentes
      if (attachments.length > 0) {
        const uploadedAttachments = [];

        for (const attachment of attachments) {
          const fileName = firebaseStorage.generateUniqueFileName(
            attachment.name,
            currentUserId
          );
          const path = firebaseStorage.buildStoragePath("messages", fileName);

          const result = await firebaseStorage.uploadFile(attachment, path, {
            contentType: attachment.type,
            customMetadata: {
              messageId: Date.now().toString(),
              uploadedBy: currentUserId,
            },
          });

          if (result.success) {
            uploadedAttachments.push({
              type: attachment.type.startsWith("image/")
                ? "image"
                : attachment.type.startsWith("video/")
                ? "video"
                : "file",
              url: result.url,
              name: attachment.name,
              size: attachment.size,
            });
          }
        }

        messageData.attachments = uploadedAttachments;
        messageData.type = attachments.length > 0 ? "media" : "text";
      }

      const result = await firebaseMessaging.sendMessage(
        conversationId,
        messageData
      );

      if (result.success) {
        setNewMessage("");
        setAttachments([]);
        if (onMessageSent) {
          onMessageSent(result.message);
        }
      }
    } catch (error) {
      console.error("Erreur envoi message:", error);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await firebaseMessaging.deleteMessage(messageId);
    } catch (error) {
      console.error("Erreur suppression message:", error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = (message) => {
    const isOwnMessage = message.senderId === currentUserId;

    return (
      <div
        key={message.id}
        className={`flex ${
          isOwnMessage ? "justify-end" : "justify-start"
        } mb-4`}
      >
        <div
          className={`flex ${
            isOwnMessage ? "flex-row-reverse" : "flex-row"
          } items-end space-x-2 max-w-xs lg:max-w-md`}
        >
          {!isOwnMessage && (
            <Avatar className="w-8 h-8">
              <AvatarImage src={otherUserAvatar} />
              <AvatarFallback>{otherUserName?.charAt(0)}</AvatarFallback>
            </Avatar>
          )}

          <div
            className={`rounded-lg px-3 py-2 ${
              isOwnMessage
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {message.content && <p className="text-sm">{message.content}</p>}

            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div key={index} className="max-w-xs">
                    {attachment.type === "image" && (
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="rounded max-w-full h-auto cursor-pointer hover:opacity-80"
                        onClick={() => window.open(attachment.url, "_blank")}
                      />
                    )}
                    {attachment.type === "video" && (
                      <video
                        src={attachment.url}
                        controls
                        className="rounded max-w-full h-auto"
                      />
                    )}
                    {attachment.type === "file" && (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-500 hover:underline"
                      >
                        <File className="w-4 h-4" />
                        <span className="text-xs">{attachment.name}</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div
              className={`text-xs mt-1 ${
                isOwnMessage ? "text-blue-100" : "text-gray-500"
              }`}
            >
              {formatTime(message.timestamp)}
            </div>
          </div>

          {isOwnMessage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => deleteMessage(message.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* En-tête de la conversation */}
      <div className="border-b p-4 bg-white">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={otherUserAvatar} />
            <AvatarFallback>{otherUserName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{otherUserName}</h3>
            <p className="text-sm text-gray-500">En ligne</p>
          </div>
        </div>
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Aucun message pour le moment</p>
            <p className="text-sm">Commencez la conversation !</p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <div className="border-t p-4 bg-white">
        {/* Pièces jointes */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2"
              >
                <span className="text-sm text-gray-600">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(index)}
                  className="h-6 w-6 p-0 hover:bg-red-100"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="px-3"
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          <Input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,application/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tapez votre message..."
            className="flex-1"
          />

          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() && attachments.length === 0}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FirebaseMessaging;
