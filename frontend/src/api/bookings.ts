import api from './client';
import { Booking, Page, BookingFormData, BookingStatus } from '../types';

export const bookingsApi = {
  create: (data: BookingFormData) =>
    api.post<Booking>('/bookings', data).then(r => r.data),

  getMyBookings: () =>
    api.get<Booking[]>('/bookings/my').then(r => r.data),

  getById: (id: string) =>
    api.get<Booking>(`/bookings/${id}`).then(r => r.data),

  getAll: (params: {
    status?: BookingStatus;
    resourceId?: string;
    date?: string;
    page?: number;
    size?: number;
  }) => api.get<Page<Booking>>('/bookings', { params }).then(r => r.data),

  review: (id: string, data: { approved: boolean; adminNote?: string }) =>
    api.post<Booking>(`/bookings/${id}/review`, data).then(r => r.data),

  cancel: (id: string) =>
    api.post<Booking>(`/bookings/${id}/cancel`).then(r => r.data),
};
