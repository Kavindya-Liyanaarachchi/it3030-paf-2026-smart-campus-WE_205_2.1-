import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { bookingsApi } from '../api/bookings';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { formatTime } from '../utils';
import toast from 'react-hot-toast';

export default function NewBookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    resourceId: searchParams.get('resourceId') ?? '',   // String, not Number
    bookingDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    purpose: '',
    expectedAttendees: '',
  });

  const mutation = useMutation({
    mutationFn: () => bookingsApi.create({
      resourceId: form.resourceId as any,
      bookingDate: form.bookingDate,
      startTime: form.startTime,
      endTime: form.endTime,
      purpose: form.purpose,
      expectedAttendees: form.expectedAttendees ? Number(form.expectedAttendees) : undefined,
    }),
    onSuccess: () => {
      toast.success('Booking request submitted!');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      navigate('/bookings');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Booking failed'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.resourceId) return toast.error('Please select a resource');
    if (!form.purpose.trim()) return toast.error('Please enter a purpose');
    if (form.startTime >= form.endTime) return toast.error('Start time must be before end time');
    mutation.mutate();
  };

  return (
    <div className="max-w-2xl space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="space-y-2">
        <h1 className="font-display text-3xl font-700 text-surface-900 dark:text-white">New Booking</h1>
        <p className="text-surface-500 dark:text-surface-400 text-sm">
          Request a resource booking — admins will review and approve.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-8 space-y-6 shadow-lg border border-surface-200 dark:border-surface-700">
        {/* Resource ID input */}
        <div>
          <label className="label font-semibold text-surface-900 dark:text-white">Resource ID *</label>
          <input
            type="text"
            value={form.resourceId}
            onChange={e => setForm(f => ({ ...f, resourceId: e.target.value }))}
            className="input mt-1 border-surface-300 dark:border-surface-600"
            placeholder="Enter resource ID (e.g., ROOM-101, LAB-02)"
            required
          />
          <p className="text-xs text-surface-400 mt-2">The unique identifier for the resource you want to book</p>
        </div>

        {/* Date */}
        <div>
          <label className="label font-semibold text-surface-900 dark:text-white">Date *</label>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-surface-400" />
            <input
              type="date"
              value={form.bookingDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setForm(f => ({ ...f, bookingDate: e.target.value }))}
              className="input mt-1 border-surface-300 dark:border-surface-600"
              required
            />
          </div>
        </div>

        {/* Time range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label font-semibold text-surface-900 dark:text-white">Start Time *</label>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-surface-400" />
              <input
                type="time"
                value={form.startTime}
                onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                className="input mt-1 border-surface-300 dark:border-surface-600"
                required
              />
            </div>
          </div>
          <div>
            <label className="label font-semibold text-surface-900 dark:text-white">End Time *</label>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-surface-400" />
              <input
                type="time"
                value={form.endTime}
                onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                className="input mt-1 border-surface-300 dark:border-surface-600"
                required
              />
            </div>
          </div>
        </div>

        {/* Purpose */}
        <div>
          <label className="label font-semibold text-surface-900 dark:text-white">Purpose *</label>
          <textarea
            value={form.purpose}
            onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
            placeholder="Describe the purpose of your booking..."
            className="input resize-none border-surface-300 dark:border-surface-600"
            rows={4}
            maxLength={500}
            required
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-surface-400">Max 500 characters</span>
            <span className="text-xs text-surface-500 font-medium">{form.purpose.length}/500</span>
          </div>
        </div>

        {/* Expected attendees */}
        <div>
          <label className="label">Expected Attendees</label>
          <input
            type="number"
            value={form.expectedAttendees}
            onChange={e => setForm(f => ({ ...f, expectedAttendees: e.target.value }))}
            placeholder="Number of attendees"
            min={1}
            className="input"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold">
            {mutation.isPending
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Calendar className="w-5 h-5" />
            }
            {mutation.isPending ? 'Submitting...' : 'Submit Booking Request'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary py-3 px-6 rounded-lg font-semibold">Cancel</button>
        </div>
      </form>
    </div>
  );
}
