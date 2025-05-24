import { create } from "zustand";
import api from "../api/api";

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  // Fetch notifications from API
  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/api/users/notifications");
      let notifications = response.data || [];
      notifications = notifications.sort((a, b) => new Date(b.createDate) - new Date(a.createDate));
      // Calculate unread count
      const unreadCount = notifications.filter(notif => !notif.isSeen).length;
      
      set({ 
        notifications,
        unreadCount,
        loading: false 
      });
      
      return notifications;
    } catch (err) {
      console.error("Error fetching notifications:", err);
      set({ 
        error: err.message || "Failed to fetch notifications", 
        loading: false 
      });
      return [];
    }
  },

  // Mark a notification as read/seen
  markAsRead: async (notificationId) => {
    try {
      // Find the notification to update
      const notification = get().notifications.find(n => n.id === notificationId);
      
      if (!notification) {
        throw new Error("Notification not found");
      }
      
      // If already seen, do nothing
      if (notification.isSeen) {
        return true;
      }
      
      // Prepare request body with all required fields
      const requestBody = {
        id: notification.id,
        title: notification.title,
        content: notification.content,
        isSeen: true,
        imageURL: notification.imageURL || "",
        source: notification.source || 0,
        createDate: notification.createDate
      };
      
      // Call API to mark notification as read
      await api.put("/api/notifications", requestBody);
      
      // Update local state
      set(state => ({
        notifications: state.notifications.map(n => 
          n.id === notificationId ? { ...n, isSeen: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
      
      return true;
    } catch (err) {
      console.error("Error marking notification as read:", err);
      return false;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const { notifications } = get();
    const unreadNotifications = notifications.filter(n => !n.isSeen);
    
    if (unreadNotifications.length === 0) {
      return true;
    }
    
    try {
      // Mark each unread notification as read one by one
      const promises = unreadNotifications.map(notification => {
        const requestBody = {
          id: notification.id,
          title: notification.title,
          content: notification.content,
          isSeen: true,
          imageURL: notification.imageURL || "",
          source: notification.source || 0,
          createDate: notification.createDate
        };
        
        return api.put("/api/notifications", requestBody);
      });
      
      await Promise.all(promises);
      
      // Update local state
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isSeen: true })),
        unreadCount: 0
      }));
      
      return true;
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      return false;
    }
  },

  // Reset store state
  resetNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null
    });
  }
}));

export default useNotificationStore; 