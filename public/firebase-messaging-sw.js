// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
// Replace 10.13.2 with latest version of the Firebase JS SDK.
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);
importScripts("/utils-notification-helper.js");
importScripts("/logo.png");
// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyDB9_6UdM2AHdJCuMY9vr89OimC-PIjdgQ",
  authDomain: "greenspace-39980.firebaseapp.com",
  projectId: "greenspace-39980",
  storageBucket: "greenspace-39980.firebasestorage.app",
  messagingSenderId: "902983463246",
  appId: "1:902983463246:web:9c2b418342ed1621106e1f",
  measurementId: "G-QCS2E0HBZN",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const title = payload.notification.title || "Thông báo từ GreenSpace";
  const formattedContent = self.getFormattedNotificationContent(
    payload.notification
  );

  const notificationOptions = {
    body: formattedContent,
    icon: "/logo.png",
  };

  self.registration.showNotification(title, notificationOptions);

  // const notificationTitle = payload.notification.title;
  // const notificationOptions = {
  //   body: payload.notification.body,
  //   icon: payload.notification.image, // icon hiển thị, bạn có thể thay
  // };
  // self.registration.showNotification(notificationTitle, notificationOptions);
});
