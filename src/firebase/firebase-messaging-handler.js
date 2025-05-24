// src/firebase/firebase-messaging-handler.js
import { onMessage } from 'firebase/messaging';
import { messaging } from './config';
import { notification } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import React from 'react';
import useNotificationStore from '@/stores/useNotificationStore';

export const setupForegroundFCMListener = () => {
  onMessage(messaging, (payload) => {
    console.log('🔔 Foreground FCM received:', payload);

    const { title, body } = payload.notification;

    // Hiển thị thông báo
    notification.open({
      message: title,
      description: body,
      placement: 'bottomRight',
      duration: 5,
      icon: React.createElement(BellOutlined, { style: { color: '#4caf50' } }),
    });

    // 👉 Tự động fetch lại notification mới
    const fetchNotifications = useNotificationStore.getState().fetchNotifications;
    if (fetchNotifications) {
      fetchNotifications();
    }
  });
};
