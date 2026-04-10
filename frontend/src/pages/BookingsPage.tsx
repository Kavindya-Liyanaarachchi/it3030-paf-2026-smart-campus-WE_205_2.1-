import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { bookingsApi } from '../api/bookings';
import { BookingStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { bookingStatusBadge, formatDate, formatTime, timeAgo } from '../utils';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const STATUS_TABS: { label: string; value: BookingStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function BookingsPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN', 'MANAGER');
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [page, setPage] = useState(0);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const { data: myBookings = [], isLoading: myLoading } = useQuery({
    queryKey: ['bookings', 'my'],
    queryFn: bookingsApi.getMyBookings,
    enabled: !isAdmin,
  });

  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ['bookings', 'all', { status: statusFilter, page }],
    queryFn: () => bookingsApi.getAll({ status: statusFilter || undefined, page, size: 20 }),
    enabled: isAdmin,
  });

  const cancelMutation = useMutation({
    mutationFn: bookingsApi.cancel,
    onSuccess: () => {
      toast.success('Booking cancelled');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: () => toast.error('Failed to cancel booking'),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, approved }: { id: number; approved: boolean }) =>
      bookingsApi.review(id, { approved, adminNote: reviewNote }),
    onSuccess: () => {
      toast.success('Booking reviewed');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setReviewingId(null);
      setReviewNote('');
    },
    onError: () => toast.error('Review failed'),
  });

  const bookings = isAdmin ? (allData?.content ?? []) : myBookings;
  const isLoading = isAdmin ? allLoading : myLoading;
  const displayBookings = statusFilter
    ? bookings.filter(b => b.status === statusFilter)
    : bookings;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-700 text-surface-900 dark:text-white">
            {isAdmin ? 'All Bookings' : 'My Bookings'}
          </h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
            {isAdmin ? 'Review and manage all booking requests' : 'Manage your resource reservations'}
          </p>
        </div>
        <button onClick={() => navigate('/bookings/new')} className="btn-primary">
          <Plus className="w-4 h-4" /> New Booking
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl w-fit">
        {STATUS_TABS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => { setStatusFilter(value); setPage(0); }}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              statusFilter === value
                ? 'bg-white dark:bg-surface-900 text-surface-900 dark:text-white shadow-sm'
                : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : displayBookings.length === 0 ? (
        <div className="card py-16 text-center">
          <Calendar className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
          <h3 className="font-medium text-surface-700 dark:text-surface-300 mb-1">No bookings found</h3>
          <button onClick={() => navigate('/bookings/new')} className="btn-primary mt-3 text-sm">
            <Plus className="w-4 h-4" /> Make a Booking
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayBookings.map((booking) => (
            <div key={booking.id} className="card p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-50 dark:bg-brand-950/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-brand-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-surface-900 dark:text-surface-100 text-sm">
                        {booking.resource.name}
                      </h3>
                      {isAdmin && (
                        <p className="text-xs text-brand-500 font-medium mt-0.5">{booking.user.name}</p>
                      )}
                    </div>
                    <span className={bookingStatusBadge(booking.status)}>{booking.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-surface-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(booking.bookingDate)}</span>
                    <span>{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
                    <span className="italic">"{booking.purpose}"</span>
                  </div>
                  {booking.adminNote && (
                    <div className="mt-2 text-xs text-surface-500 italic">
                      Note: {booking.adminNote}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {isAdmin && booking.status === 'PENDING' && (
                    <>
                      {reviewingId === booking.id ? (
                        <div className="flex flex-col gap-2 w-52">
                          <input
                            value={reviewNote}
                            onChange={e => setReviewNote(e.target.value)}
                            placeholder="Note (optional)"
                            className="input text-xs py-1"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => reviewMutation.mutate({ id: booking.id, approved: true })}
                              className="btn-primary text-xs px-2 py-1 flex-1"
                              disabled={reviewMutation.isPending}
                            >
                              <CheckCircle className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => reviewMutation.mutate({ id: booking.id, approved: false })}
                              className="btn-danger text-xs px-2 py-1 flex-1"
                              disabled={reviewMutation.isPending}
                            >
                              <XCircle className="w-3 h-3" /> Reject
                            </button>
                            <button
                              onClick={() => setReviewingId(null)}
                              className="btn-ghost text-xs px-2 py-1"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReviewingId(booking.id)}
                          className="btn-secondary text-xs"
                        >
                          Review
                        </button>
                      )}
                    </>
                  )}
                  {['PENDING', 'APPROVED'].includes(booking.status) && (
                    <button
                      onClick={() => {
                        if (confirm('Cancel this booking?')) cancelMutation.mutate(booking.id);
                      }}
                      className="btn-ghost text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                      disabled={cancelMutation.isPending}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination for admin */}
      {isAdmin && allData && allData.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="btn-secondary text-xs px-3 py-1.5">Previous</button>
          <span className="text-sm text-surface-500">Page {page + 1} of {allData.totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={allData.last} className="btn-secondary text-xs px-3 py-1.5">Next</button>
        </div>
      )}
    </div>
  );
}
