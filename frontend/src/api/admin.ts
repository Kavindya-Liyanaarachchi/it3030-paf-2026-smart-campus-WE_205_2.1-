import api from './client';
import { User, UserRole } from '../types';

export const adminApi = {
  getUsers: () => api.get<User[]>('/admin/users').then(r => r.data),

  updateRole: (id: string, role: UserRole) =>
    api.patch<User>(`/admin/users/${id}/role`, null, { params: { role } }).then(r => r.data),

  toggleEnabled: (id: string) =>
    api.patch<User>(`/admin/users/${id}/toggle`).then(r => r.data),
};
