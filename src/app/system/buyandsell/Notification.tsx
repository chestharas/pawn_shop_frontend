// buyandsell/Notification.tsx
'use client';

import { useEffect } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { colors } from '@/lib/colors';

interface Notification {
  type: 'success' | 'error';
  message: string;
}

interface NotificationProps {
  notification: Notification | null;
  onClose: () => void;
}

export default function Notification({ notification, onClose }: NotificationProps) {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div 
      className="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2"
      style={{
        backgroundColor: notification.type === 'success' ? colors.success[50] : colors.error[50],
        color: notification.type === 'success' ? colors.success[800] : colors.error[800],
        border: `1px solid ${notification.type === 'success' ? colors.success[200] : colors.error[200]}`
      }}
    >
      {notification.type === 'success' ? (
        <CheckCircle className="h-5 w-5" />
      ) : (
        <AlertCircle className="h-5 w-5" />
      )}
      <span>{notification.message}</span>
      <button onClick={onClose}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}