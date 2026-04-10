import api from './client';
import { Ticket, Page, TicketFormData, TicketStatus, TicketComment, TicketAttachment } from '../types';

export const ticketsApi = {
  create: (data: TicketFormData) =>
    api.post<Ticket>('/tickets', data).then(r => r.data),

  uploadAttachment: (ticketId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<TicketAttachment>(`/tickets/${ticketId}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  update: (id: string, data: {
    status?: TicketStatus;
    resolutionNotes?: string;
    rejectionReason?: string;
    assignedToId?: string;
  }) => api.patch<Ticket>(`/tickets/${id}`, data).then(r => r.data),

  getById: (id: string) =>
    api.get<Ticket>(`/tickets/${id}`).then(r => r.data),

  getMyTickets: () =>
    api.get<Ticket[]>('/tickets/my').then(r => r.data),

  getAssigned: () =>
    api.get<Ticket[]>('/tickets/assigned').then(r => r.data),

  getAll: (params: {
    status?: TicketStatus;
    resourceId?: string;
    page?: number;
    size?: number;
  }) => api.get<Page<Ticket>>('/tickets', { params }).then(r => r.data),

  addComment: (ticketId: string, content: string) =>
    api.post<TicketComment>(`/tickets/${ticketId}/comments`, { content }).then(r => r.data),

  editComment: (commentId: string, content: string) =>
    api.put<TicketComment>(`/tickets/comments/${commentId}`, { content }).then(r => r.data),

  deleteComment: (commentId: string) =>
    api.delete(`/tickets/comments/${commentId}`),
};
