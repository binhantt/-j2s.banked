import { api } from './api';

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export const notificationApi = {
  getUserNotifications: async (userId: number): Promise<Notification[]> => {
    try {
      const response = await api.get(`/api/notifications/user/${userId}`);
      return response.data;
    } catch (error) {
      console.warn('Failed to get user notifications:', error);
      return []; // Return empty array as fallback
    }
  },

  getUnreadNotifications: async (userId: number): Promise<Notification[]> => {
    try {
      const response = await api.get(`/api/notifications/user/${userId}/unread`);
      return response.data;
    } catch (error) {
      console.warn('Failed to get unread notifications:', error);
      return []; // Return empty array as fallback
    }
  },

  getUnreadCount: async (userId: number): Promise<number> => {
    try {
      const response = await api.get(`/api/notifications/user/${userId}/count`);
      return response.data.count;
    } catch (error) {
      console.warn('Failed to get notification count:', error);
      return 0; // Return 0 as fallback
    }
  },

  /**
   * Lay tong so thong bao + tin nhan chua doc cho navbar badge
   * Tra ve: { notificationCount, chatCount, total }
   */
  getNavbarCount: async (userId: number): Promise<{ notificationCount: number; chatCount: number; total: number }> => {
    try {
      const response = await api.get(`/api/notifications/user/${userId}/navbar-count`);
      return response.data;
    } catch (error) {
      console.warn('Failed to get navbar count:', error);
      return { notificationCount: 0, chatCount: 0, total: 0 };
    }
  },

  markAsRead: async (id: number): Promise<void> => {
    try {
      await api.put(`/api/notifications/${id}/read`);
    } catch (error) {
      console.warn('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async (userId: number): Promise<void> => {
    try {
      await api.put(`/api/notifications/user/${userId}/read-all`);
    } catch (error) {
      console.warn('Failed to mark all notifications as read:', error);
    }
  },

  deleteNotification: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/notifications/${id}`);
    } catch (error) {
      console.warn('Failed to delete notification:', error);
    }
  },
};
