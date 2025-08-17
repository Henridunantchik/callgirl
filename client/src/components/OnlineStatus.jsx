import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';

const OnlineStatus = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);

  // Update online status periodically
  useEffect(() => {
    if (!user) return;

    const updateOnlineStatus = async () => {
      try {
        await userAPI.updateOnlineStatus();
        setIsOnline(true);
      } catch (error) {
        console.error('Failed to update online status:', error);
      }
    };

    // Update immediately
    updateOnlineStatus();

    // Update every 5 minutes
    const interval = setInterval(updateOnlineStatus, 5 * 60 * 1000);

    // Mark as offline when user leaves the page
    const handleBeforeUnload = async () => {
      try {
        await userAPI.markOffline();
      } catch (error) {
        console.error('Failed to mark offline:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Mark as offline when component unmounts
      userAPI.markOffline().catch(console.error);
    };
  }, [user]);

  // Don't render anything visible, this is just for tracking
  return null;
};

export default OnlineStatus;
