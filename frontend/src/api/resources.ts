import api from './client';
import { Resource, Page, ResourceFormData, ResourceStatus, ResourceType } from '../types';

export const resourcesApi = {
  search: (params: {
    type?: ResourceType;
    minCapacity?: number;
    search?: string;
    status?: ResourceStatus;
    page?: number;
    size?: number;
  }) => api.get<Page<Resource>>('/resources', { params }).then(r => r.data),

  getById: (id: string) =>
    api.get<Resource>(`/resources/${id}`).then(r => r.data),

  create: (data: ResourceFormData) =>
    api.post<Resource>('/resources', data).then(r => r.data),

  update: (id: string, data: ResourceFormData) =>
    api.put<Resource>(`/resources/${id}`, data).then(r => r.data),

  updateStatus: (id: string, status: ResourceStatus) =>
    api.patch<Resource>(`/resources/${id}/status`, null, { params: { status } }).then(r => r.data),

  delete: (id: string) => api.delete(`/resources/${id}`),
};
