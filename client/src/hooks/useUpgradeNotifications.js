import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

const useUpgradeNotifications = () => {
  const { user } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [currentNotificationType, setCurrentNotificationType] = useState("clients");
  const [lastNotificationTime, setLastNotificationTime] = useState(0);

  // Types de notifications qui tournent
  const notificationTypes = ["clients", "visibility", "competition", "statistics"];

  // Vérifier si l'utilisateur est un escort qui peut recevoir des notifications
  const shouldShowNotifications = useCallback(() => {
    if (!user || user.user?.role !== "escort") return false;
    
    const currentPlan = user.user?.subscriptionTier || "basic";
    
    // Pas de notifications pour les Premium
    if (currentPlan === "premium") return false;
    
    return true;
  }, [user]);

  // Obtenir l'intervalle de notification selon le plan
  const getNotificationInterval = useCallback(() => {
    if (!user) return 15 * 60 * 1000; // 15 minutes par défaut
    
    const currentPlan = user.user?.subscriptionTier || "basic";
    
    if (currentPlan === "basic") return 15 * 60 * 1000; // 15 minutes
    if (currentPlan === "featured") return 30 * 60 * 1000; // 30 minutes
    
    return 15 * 60 * 1000; // 15 minutes par défaut
  }, [user]);

  // Vérifier si on doit afficher une notification
  const shouldShowNotification = useCallback(() => {
    if (!shouldShowNotifications()) return false;
    
    const now = Date.now();
    const interval = getNotificationInterval();
    const timeSinceLastNotification = now - lastNotificationTime;
    
    // Première visite : notification après 5 minutes
    if (lastNotificationTime === 0) {
      return timeSinceLastNotification >= 5 * 60 * 1000; // 5 minutes
    }
    
    // Notifications régulières selon l'intervalle
    return timeSinceLastNotification >= interval;
  }, [shouldShowNotifications, getNotificationInterval, lastNotificationTime]);

  // Afficher la prochaine notification
  const showNextNotification = useCallback(() => {
    if (!shouldShowNotification()) return;
    
    // Choisir le prochain type de notification
    const currentIndex = notificationTypes.indexOf(currentNotificationType);
    const nextIndex = (currentIndex + 1) % notificationTypes.length;
    const nextType = notificationTypes[nextIndex];
    
    setCurrentNotificationType(nextType);
    setIsNotificationOpen(true);
    setLastNotificationTime(Date.now());
    
    // Sauvegarder dans localStorage
    localStorage.setItem("lastUpgradeNotification", Date.now().toString());
    localStorage.setItem("currentNotificationType", nextType);
  }, [shouldShowNotification, currentNotificationType]);

  // Fermer la notification
  const closeNotification = useCallback(() => {
    setIsNotificationOpen(false);
  }, []);

  // Gérer le clic "Plus tard"
  const handleLater = useCallback(() => {
    closeNotification();
    // Remettre la notification dans 5 minutes
    setTimeout(() => {
      setLastNotificationTime(Date.now() - (getNotificationInterval() - 5 * 60 * 1000));
    }, 5 * 60 * 1000);
  }, [closeNotification, getNotificationInterval]);

  // Gérer le clic "Upgrade"
  const handleUpgrade = useCallback(() => {
    closeNotification();
    // Rediriger vers la page d'upgrade
    window.location.href = "/escort/upgrade";
  }, [closeNotification]);

  // Initialiser depuis localStorage
  useEffect(() => {
    const savedTime = localStorage.getItem("lastUpgradeNotification");
    const savedType = localStorage.getItem("currentNotificationType");
    
    if (savedTime) {
      setLastNotificationTime(parseInt(savedTime));
    }
    
    if (savedType && notificationTypes.includes(savedType)) {
      setCurrentNotificationType(savedType);
    }
  }, []);

  // Timer pour vérifier les notifications
  useEffect(() => {
    if (!shouldShowNotifications()) return;
    
    const checkInterval = setInterval(() => {
      if (shouldShowNotification()) {
        showNextNotification();
      }
    }, 60 * 1000); // Vérifier toutes les minutes
    
    return () => clearInterval(checkInterval);
  }, [shouldShowNotifications, shouldShowNotification, showNextNotification]);

  // Notification après 5 minutes pour la première visite
  useEffect(() => {
    if (!shouldShowNotifications()) return;
    
    const firstVisitTimer = setTimeout(() => {
      if (lastNotificationTime === 0) {
        showNextNotification();
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearTimeout(firstVisitTimer);
  }, [shouldShowNotifications, lastNotificationTime, showNextNotification]);

  return {
    isNotificationOpen,
    currentNotificationType,
    closeNotification,
    handleLater,
    handleUpgrade,
    shouldShowNotifications: shouldShowNotifications(),
  };
};

export default useUpgradeNotifications;
