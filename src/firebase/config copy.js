import useNotificationStore from '@/stores/useNotificationStore';
import { notification } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import React from 'react';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const messaging = getMessaging(app);

// Function to get FCM token
export const fetchFCMToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // Register the service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Service worker registered', registration);
    
    // Wait for the service worker to be activated
    if (registration.installing || registration.waiting) {
      // Wait for the service worker to become active
      await new Promise(resolve => {
        const serviceWorker = registration.installing || registration.waiting;
        serviceWorker.addEventListener('statechange', e => {
          if (e.target.state === 'activated') {
            console.log('Service worker now activated');
            resolve();
          }
        });
      });
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    const token = await getToken(getMessaging(), {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log('✅ FCM Token:', token);
      return token;
    } else {
      console.log('⚠️ No FCM token available.');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching FCM token:', error);
    return null;
  }
};

onMessage(messaging, (payload) => {
  console.log('🔔 Foreground notification received:', payload);

  // Optionally show in-app toast or alert
  const { title, body } = payload.notification;
  // alert(`${title}: ${body}`);
  notification.open({
    message: title,
    description: body,
    placement: 'bottomRight',
    duration: 5,
    icon: React.createElement(BellOutlined, { style: { color: '#4caf50' } }), // xanh lá
  });

  // Tự động refetch lại notifications nếu bạn muốn
  useNotificationStore.getState().fetchNotifications();
});

export default app;