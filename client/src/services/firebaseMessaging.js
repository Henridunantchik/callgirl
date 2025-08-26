import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../helpers/firebase";

class FirebaseMessagingService {
  constructor() {
    this.db = db;
  }

  // Créer une nouvelle conversation
  async createConversation(participants, initialMessage = null) {
    try {
      const conversationData = {
        participants: participants,
        lastMessage: initialMessage,
        lastMessageTime: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(this.db, "conversations"),
        conversationData
      );

      if (initialMessage) {
        await this.sendMessage(docRef.id, initialMessage);
      }

      return {
        success: true,
        conversationId: docRef.id,
        conversation: { id: docRef.id, ...conversationData },
      };
    } catch (error) {
      console.error("Erreur création conversation:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Envoyer un message
  async sendMessage(conversationId, messageData) {
    try {
      const message = {
        ...messageData,
        conversationId: conversationId,
        timestamp: serverTimestamp(),
        read: false,
      };

      const docRef = await addDoc(collection(this.db, "messages"), message);

      // Mettre à jour la conversation avec le dernier message
      const conversationRef = doc(this.db, "conversations", conversationId);
      await updateDoc(conversationRef, {
        lastMessage: messageData.content || messageData.text,
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        success: true,
        messageId: docRef.id,
        message: { id: docRef.id, ...message },
      };
    } catch (error) {
      console.error("Erreur envoi message:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Obtenir les conversations d'un utilisateur
  async getUserConversations(userId) {
    try {
      const q = query(
        collection(this.db, "conversations"),
        where("participants", "array-contains", userId),
        orderBy("updatedAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const conversations = [];

      querySnapshot.forEach((doc) => {
        conversations.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        conversations: conversations,
      };
    } catch (error) {
      console.error("Erreur récupération conversations:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Obtenir les messages d'une conversation
  async getConversationMessages(conversationId, limitCount = 50) {
    try {
      const q = query(
        collection(this.db, "messages"),
        where("conversationId", "==", conversationId),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const messages = [];

      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Remettre dans l'ordre chronologique
      messages.reverse();

      return {
        success: true,
        messages: messages,
      };
    } catch (error) {
      console.error("Erreur récupération messages:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Écouter les messages en temps réel
  listenToConversation(conversationId, callback) {
    const q = query(
      collection(this.db, "messages"),
      where("conversationId", "==", conversationId),
      orderBy("timestamp", "asc")
    );

    return onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      callback(messages);
    });
  }

  // Marquer un message comme lu
  async markMessageAsRead(messageId) {
    try {
      const messageRef = doc(this.db, "messages", messageId);
      await updateDoc(messageRef, {
        read: true,
        readAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error("Erreur marquage message lu:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Supprimer un message
  async deleteMessage(messageId) {
    try {
      await deleteDoc(doc(this.db, "messages", messageId));
      return { success: true };
    } catch (error) {
      console.error("Erreur suppression message:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Supprimer une conversation
  async deleteConversation(conversationId) {
    try {
      // Supprimer tous les messages de la conversation
      const messagesQuery = query(
        collection(this.db, "messages"),
        where("conversationId", "==", conversationId)
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      const deletePromises = messagesSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      // Supprimer la conversation
      await deleteDoc(doc(this.db, "conversations", conversationId));

      return { success: true };
    } catch (error) {
      console.error("Erreur suppression conversation:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Rechercher des conversations
  async searchConversations(userId, searchTerm) {
    try {
      const q = query(
        collection(this.db, "conversations"),
        where("participants", "array-contains", userId)
      );

      const querySnapshot = await getDocs(q);
      const conversations = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.lastMessage &&
          data.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          conversations.push({
            id: doc.id,
            ...data,
          });
        }
      });

      return {
        success: true,
        conversations: conversations,
      };
    } catch (error) {
      console.error("Erreur recherche conversations:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new FirebaseMessagingService();
