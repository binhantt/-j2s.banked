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
    const response = await api.get(`/api/notifications/user/${userId}`);
    return response.data;
  },

  getUnreadNotifications: async (userId: number): Promise<Notification[]> => {
    const response = await api.get(`/api/notifications/user/${userId}/unread`);
    return response.data;
  },

  getUnreadCount: async (userId: number): Promise<number> => {
    const response = await api.get(`/api/notifications/user/${userId}/count`);
    return response.data.count;
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.put(`/api/notifications/${id}/read`);
  },

  markAllAsRead: async (userId: number): Promise<void> => {
    await api.put(`/api/notifications/user/${userId}/read-all`);
  },

  deleteNotification: async (id: number): Promise<void> => {
    await api.delete(`/api/notifications/${id}`);
  },
};
