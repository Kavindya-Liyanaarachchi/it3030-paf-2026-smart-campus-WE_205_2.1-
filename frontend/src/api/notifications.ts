import api from './client';
import { Notification, NotificationPreference } from '../types';

export const notificationsApi = {
  getAll: () =>
    api.get<Notification[]>('/notifications').then(r => r.data),

  getUnread: () =>
    api.get<Notification[]>('/notifications/unread').then(r => r.data),

  getCount: () =>
    api.get<{ count: number }>('/notifications/count').then(r => r.data),

  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.post('/notifications/read-all'),

  getPreferences: () =>
    api.get<NotificationPreference>('/notifications/preferences').then(r => r.data),

  updatePreferences: (data: { disabledTypes: string[]; muteAll: boolean }) =>
    api.put<NotificationPreference>('/notifications/preferences', data).then(r => r.data),
};

export interface NotificationPreference {
  id: string;
  bookingApproved: boolean;
  bookingRejected: boolean;
  bookingCancelled: boolean;
  ticketStatusChanged: boolean;
  ticketAssigned: boolean;
  ticketCommentAdded: boolean;
  ticketResolved: boolean;
  systemNotifications: boolean;
}

export const notificationPreferencesApi = {
  get: () => api.get<NotificationPreference>('/notifications/preferences').then(r => r.data),
  update: (data: NotificationPreference) =>
    api.put<NotificationPreference>('/notifications/preferences', data).then(r => r.data),
};
