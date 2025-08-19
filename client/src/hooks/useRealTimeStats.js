import { useEffect, useCallback } from 'react';
import { escortAPI } from '../services/api';

export const useRealTimeStats = (escortId, onStatsUpdate) => {
  const updateStats = useCallback(async () => {
    if (!escortId) return;
    
    try {
      console.log('🔄 Updating real-time stats for escort:', escortId);
      const response = await escortAPI.getPublicEscortStats(escortId);
      
      if (response.data && response.data.data && response.data.data.stats) {
        const apiStats = response.data.data.stats;
        
        // Map API stats to frontend format
        const updatedStats = {
          views: apiStats.profileViews || 0,
          favorites: apiStats.favorites || 0,
          reviews: apiStats.reviews || 0,
          rating: apiStats.rating || 0,
          bookings: apiStats.bookings || 0,
          messages: apiStats.messages || 0,
          earnings: apiStats.earnings || 0,
        };
        
        console.log('✅ Real-time stats updated:', updatedStats);
        onStatsUpdate && onStatsUpdate(updatedStats);
      }
    } catch (error) {
      console.error('❌ Failed to update real-time stats:', error);
    }
  }, [escortId, onStatsUpdate]);

  useEffect(() => {
    if (!escortId) return;

    // Listen for real-time events
    const handleFavoriteToggled = (event) => {
      const { escortId: eventEscortId } = event.detail;
      if (eventEscortId === escortId) {
        console.log('❤️ Favorite toggled, updating stats...');
        updateStats();
      }
    };

    const handleReviewCreated = (event) => {
      const { escortId: eventEscortId } = event.detail;
      if (eventEscortId === escortId) {
        console.log('⭐ Review created, updating stats...');
        updateStats();
      }
    };

    const handleReviewUpdated = (event) => {
      const { escortId: eventEscortId } = event.detail;
      if (eventEscortId === escortId) {
        console.log('✏️ Review updated, updating stats...');
        updateStats();
      }
    };

    const handleReviewDeleted = (event) => {
      const { escortId: eventEscortId } = event.detail;
      if (eventEscortId === escortId) {
        console.log('🗑️ Review deleted, updating stats...');
        updateStats();
      }
    };

    const handleBookingCreated = (event) => {
      const { escortId: eventEscortId } = event.detail;
      if (eventEscortId === escortId) {
        console.log('📅 Booking created, updating stats...');
        updateStats();
      }
    };

    // Add event listeners
    window.addEventListener('favoriteToggled', handleFavoriteToggled);
    window.addEventListener('reviewCreated', handleReviewCreated);
    window.addEventListener('reviewUpdated', handleReviewUpdated);
    window.addEventListener('reviewDeleted', handleReviewDeleted);
    window.addEventListener('bookingCreated', handleBookingCreated);

    // Initial stats update
    updateStats();

    // Cleanup
    return () => {
      window.removeEventListener('favoriteToggled', handleFavoriteToggled);
      window.removeEventListener('reviewCreated', handleReviewCreated);
      window.removeEventListener('reviewUpdated', handleReviewUpdated);
      window.removeEventListener('reviewDeleted', handleReviewDeleted);
      window.removeEventListener('bookingCreated', handleBookingCreated);
    };
  }, [escortId, updateStats]);

  return { updateStats };
};
