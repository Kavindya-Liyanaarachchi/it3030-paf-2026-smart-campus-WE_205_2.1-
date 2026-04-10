import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '../api/tickets';
import { adminApi } from '../api/admin';
import { useAuth } from '../contexts/AuthContext';
import { TicketStatus } from '../types';
import {
  ArrowLeft, Send, Pencil, Trash2,
  Flag , CheckCircle, Paperclip, Image,
} from 'lucide-react';
import {
  ticketStatusBadge, priorityBadge, categoryLabel,
  formatDateTime, timeAgo, formatFileSize,
} from '../utils';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];

function shortId(id: string) {
  return id.length > 8 ? id.slice(-8).toUpperCase() : id.toUpperCase();
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const isStaff = hasRole('ADMIN', 'MANAGER', 'TECHNICIAN');

  const [comment, setComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [newStatus, setNewStatus] = useState<TicketStatus | ''>('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [assigneeId, setAssigneeId] = useState<string>('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsApi.getById(id!),   // ← pass string directly, no Number()
    enabled: !!id,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminApi.getUsers,
    enabled: isStaff,
  });

  const technicians = users.filter(u =>
    ['ADMIN', 'MANAGER', 'TECHNICIAN'].includes(u.role)
  );

  const commentMutation = useMutation({
    mutationFn: () => ticketsApi.addComment(id!, comment),
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      toast.success('Comment added');
    },
    onError: () => toast.error('Failed to add comment'),
  });

  const editMutation = useMutation({
    mutationFn: (commentId: string) => ticketsApi.editComment(commentId, editContent),
    onSuccess: () => {
      setEditingCommentId(null);
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
    },
    onError: () => toast.error('Failed to edit comment'),
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => ticketsApi.deleteComment(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ticket', id] }),
    onError: () => toast.error('Failed to delete comment'),
  });

  const updateMutation = useMutation({
    mutationFn: () => ticketsApi.update(id!, {
      status: newStatus || undefined,
      resolutionNotes: resolutionNotes || undefined,
      rejectionReason: rejectionReason || undefined,
      assignedToId: assigneeId || undefined,
    }),
    onSuccess: () => {
      toast.success('Ticket updated');
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setNewStatus('');
      setResolutionNotes('');
      setRejectionReason('');
      setAssigneeId('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Update failed'),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!ticket) return (
    <div className="text-center py-20">
      <Flag  className="w-12 h-12 text-surface-300 mx-auto mb-3" />
      <p className="text-surface-400">Ticket not found</p>
      <button onClick={() => navigate('/tickets')} className="btn-secondary mt-4 text-sm">
        Back to Tickets
      </button>
    </div>
  );

  const statusColors: Record<TicketStatus, string> = {
    OPEN: 'bg-blue-500',
    IN_PROGRESS: 'bg-yellow-500',
    RESOLVED: 'bg-green-500',
    CLOSED: 'bg-gray-500',
    REJECTED: 'bg-red-500',
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <button onClick={() => navigate('/tickets')} className="btn-ghost text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Tickets
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Ticket header */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="text-xs text-surface-400 mb-1 font-mono">
                  Ticket #{shortId(ticket.id)}
                </div>
                <h1 className="font-display text-xl font-700 text-surface-900 dark:text-white">
                  {ticket.title}
                </h1>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <span className={ticketStatusBadge(ticket.status)}>
                  {ticket.status.replace('_', ' ')}
                </span>
                <span className={priorityBadge(ticket.priority)}>
                  {ticket.priority}
                </span>
              </div>
            </div>

            <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>

            {ticket.resolutionNotes && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">
                    Resolution Notes
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {ticket.resolutionNotes}
                </p>
              </div>
            )}

            {ticket.rejectionReason && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl">
                <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                  Rejection Reason
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {ticket.rejectionReason}
                </p>
              </div>
            )}
          </div>

          {/* Attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="card p-5">
              <h2 className="font-display font-600 text-surface-900 dark:text-white mb-3 flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Attachments ({ticket.attachments.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ticket.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block bg-surface-50 dark:bg-surface-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-brand-400 transition-all"
                  >
                    {/* Actual image preview */}
                    <div className="aspect-video bg-surface-100 dark:bg-surface-700 overflow-hidden">
                      <img
                        src={att.filePath}
                        alt={att.fileName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          // Fallback if image fails to load
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden flex items-center justify-center h-full">
                        <Image className="w-8 h-8 text-surface-400" />
                      </div>
                    </div>
                    <div className="p-2">
                      <div className="text-[10px] text-surface-500 truncate">{att.fileName}</div>
                      <div className="text-[10px] text-surface-400">{formatFileSize(att.fileSize)}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="card p-5">
            <h2 className="font-display font-600 text-surface-900 dark:text-white mb-4">
              Comments ({ticket.comments ? ticket.comments.length : 0})
            </h2>

            <div className="space-y-4">
              {ticket.comments && ticket.comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center flex-shrink-0 text-xs font-bold text-brand-600 dark:text-brand-400">
                    {c.author.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-surface-800 dark:text-surface-200">
                        {c.author.name}
                      </span>
                      <span className="text-[10px] text-surface-400">{timeAgo(c.createdAt)}</span>
                      {c.edited && (
                        <span className="text-[10px] text-surface-400 italic">(edited)</span>
                      )}
                    </div>

                    {editingCommentId === c.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          className="input resize-none text-sm"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => editMutation.mutate(c.id)}
                            className="btn-primary text-xs px-3 py-1.5"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCommentId(null)}
                            className="btn-ghost text-xs px-3 py-1.5"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-3 text-sm text-surface-700 dark:text-surface-300">
                        {c.content}
                      </div>
                    )}

                    {!editingCommentId && user && (
                      c.author.id === user.id || hasRole('ADMIN')
                    ) && (
                      <div className="flex gap-2 mt-1">
                        {c.author.id === user.id && (
                          <button
                            onClick={() => {
                              setEditingCommentId(c.id);
                              setEditContent(c.content);
                            }}
                            className="text-[10px] text-surface-400 hover:text-brand-500 flex items-center gap-0.5 transition-colors"
                          >
                            <Pencil className="w-2.5 h-2.5" /> Edit
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('Delete this comment?')) {
                              deleteMutation.mutate(c.id);
                            }
                          }}
                          className="text-[10px] text-surface-400 hover:text-red-500 flex items-center gap-0.5 transition-colors"
                        >
                          <Trash2 className="w-2.5 h-2.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {(!ticket.comments || ticket.comments.length === 0) && (
                <div className="text-center py-6">
                  <p className="text-sm text-surface-400">No comments yet. Be the first to comment.</p>
                </div>
              )}
            </div>

            {/* Add comment */}
            <div className="mt-4 flex gap-3 items-end">
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="input resize-none flex-1 text-sm"
                rows={2}
              />
              <button
                onClick={() => comment.trim() && commentMutation.mutate()}
                disabled={!comment.trim() || commentMutation.isPending}
                className="btn-primary h-10 px-4 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-surface-400 mt-1">Press the send button to submit</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Meta info */}
          <div className="card p-5">
            <h3 className="font-display font-600 text-surface-800 dark:text-surface-100 text-sm mb-4">
              Details
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <div className="label mb-1">Reporter</div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-[10px] font-bold text-brand-600">
                    {ticket.reporter.name[0]}
                  </div>
                  <span className="text-surface-700 dark:text-surface-300">
                    {ticket.reporter.name}
                  </span>
                </div>
              </div>

              {ticket.assignedTo && (
                <div>
                  <div className="label mb-1">Assigned To</div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-[10px] font-bold text-teal-600">
                      {ticket.assignedTo.name[0]}
                    </div>
                    <span className="text-surface-700 dark:text-surface-300">
                      {ticket.assignedTo.name}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <div className="label mb-1">Category</div>
                <span className="text-surface-700 dark:text-surface-300">
                  {categoryLabel(ticket.category)}
                </span>
              </div>

              {ticket.resource && (
                <div>
                  <div className="label mb-1">Resource</div>
                  <span className="text-surface-700 dark:text-surface-300">
                    {ticket.resource.name}
                  </span>
                </div>
              )}

              {ticket.location && (
                <div>
                  <div className="label mb-1">Location</div>
                  <span className="text-surface-700 dark:text-surface-300">{ticket.location}</span>
                </div>
              )}

              {ticket.preferredContactEmail && (
                <div>
                  <div className="label mb-1">Contact Email</div>
                  <span className="text-surface-700 dark:text-surface-300">
                    {ticket.preferredContactEmail}
                  </span>
                </div>
              )}

              <div>
                <div className="label mb-1">Created</div>
                <span className="text-surface-700 dark:text-surface-300">
                  {formatDateTime(ticket.createdAt)}
                </span>
              </div>

              <div>
                <div className="label mb-1">Last Updated</div>
                <span className="text-surface-700 dark:text-surface-300">
                  {timeAgo(ticket.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Workflow status */}
          <div className="card p-5">
            <h3 className="font-display font-600 text-surface-800 dark:text-surface-100 text-sm mb-4">
              Workflow
            </h3>
            <div className="space-y-2">
              {STATUSES.map((s) => {
                const currentIdx = STATUSES.indexOf(ticket.status);
                const idx = STATUSES.indexOf(s);
                const isPast = idx < currentIdx;
                const isCurrent = s === ticket.status;
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div className={clsx(
                      'w-2.5 h-2.5 rounded-full flex-shrink-0',
                      isCurrent ? statusColors[s]
                        : isPast ? 'bg-green-400'
                        : 'bg-surface-200 dark:bg-surface-700'
                    )} />
                    <span className={clsx(
                      'text-xs',
                      isCurrent
                        ? 'font-medium text-surface-900 dark:text-white'
                        : isPast
                        ? 'text-surface-400 line-through'
                        : 'text-surface-400'
                    )}>
                      {s.replace('_', ' ')}
                    </span>
                    {isCurrent && (
                      <span className="ml-auto text-[10px] badge-green">Current</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Staff update panel */}
          {isStaff && !['CLOSED', 'REJECTED'].includes(ticket.status) && (
            <div className="card p-5">
              <h3 className="font-display font-600 text-surface-800 dark:text-surface-100 text-sm mb-4">
                Update Ticket
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="label">Change Status</label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as TicketStatus)}
                    className="input text-xs"
                  >
                    <option value="">No change</option>
                    {STATUSES.filter(s => s !== ticket.status).map(s => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Assign Technician</label>
                  <select
                    value={assigneeId}
                    onChange={e => setAssigneeId(e.target.value)}
                    className="input text-xs"
                  >
                    <option value="">No change</option>
                    {technicians.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.role})
                      </option>
                    ))}
                  </select>
                </div>

                {(newStatus === 'RESOLVED' || ticket.status === 'RESOLVED') && (
                  <div>
                    <label className="label">Resolution Notes</label>
                    <textarea
                      value={resolutionNotes}
                      onChange={e => setResolutionNotes(e.target.value)}
                      placeholder="Describe how the issue was resolved..."
                      className="input resize-none text-xs"
                      rows={3}
                    />
                  </div>
                )}

                {newStatus === 'REJECTED' && (
                  <div>
                    <label className="label">Rejection Reason</label>
                    <textarea
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      placeholder="Reason for rejection..."
                      className="input resize-none text-xs"
                      rows={2}
                    />
                  </div>
                )}

                <button
                  onClick={() => updateMutation.mutate()}
                  disabled={
                    updateMutation.isPending ||
                    (!newStatus && !assigneeId && !resolutionNotes)
                  }
                  className="btn-primary w-full text-xs"
                >
                  {updateMutation.isPending
                    ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <CheckCircle className="w-3.5 h-3.5" />
                  }
                  Update Ticket
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
