'use client';

import { useEffect, useRef } from 'react';
import { useChatStore } from '@/stores/chat.store';

export function useMessageNotifications() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousUnreadCount = useRef(0);

  useEffect(() => {
    // Create audio element for notification sound
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/notification.mp3'); // You'll need to add this sound file
      audioRef.current.volume = 0.5;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const unsubscribe = useChatStore.subscribe((state, prevState) => {
      const currentUnreadCount = state.conversations.reduce((total, conv) => total + conv.unreadCount, 0);
      const prevUnreadCount = prevState.conversations.reduce((total, conv) => total + conv.unreadCount, 0);

      // Play sound if unread count increased
      if (currentUnreadCount > prevUnreadCount && audioRef.current) {
        audioRef.current.play().catch(err => {
          console.log('Audio play failed:', err);
        });
      }
    });

    return unsubscribe;
  }, []);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.log('Audio play failed:', err);
      });
    }
  };

  return { playNotificationSound };
}