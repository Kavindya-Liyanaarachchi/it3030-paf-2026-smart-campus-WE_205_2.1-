import api from './client';
import { User } from '../types';

export const authApi = {
  getMe: () => api.get<User>('/auth/me').then(r => r.data),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', null, { params: { refreshToken } }).then(r => r.data),
};

export const localAuthApi = {
  register: (data: { name: string; email: string; password: string }) =>
    import('./client').then(m => m.default.post('/auth/register', data).then(r => r.data)),

  login: (data: { email: string; password: string }) =>
    import('./client').then(m => m.default.post('/auth/login', data).then(r => r.data)),
};
