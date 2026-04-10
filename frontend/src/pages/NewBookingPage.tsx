import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { resourcesApi } from '../api/resources';
import { bookingsApi } from '../api/bookings';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { resourceTypeIcon, formatTime } from '../utils';
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

  const { data: resources } = useQuery({
    queryKey: ['resources', { status: 'ACTIVE', size: 100 }],
    queryFn: () => resourcesApi.search({ status: 'ACTIVE', size: 100 }),
  });

  // String comparison — works with MongoDB ObjectId strings
  const selectedResource = resources?.content.find(r => r.id === form.resourceId) ?? null;

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
      <button onClick={() => navigate(-1)} className="btn-ghost text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div>
        <h1 className="font-display text-2xl font-700 text-surface-900 dark:text-white">New Booking</h1>
        <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
          Request a resource booking — admins will review and approve.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Resource selection */}
        <div>
          <label className="label">Resource *</label>
          <select
            value={form.resourceId}
            onChange={e => setForm(f => ({ ...f, resourceId: e.target.value }))}  // keep as string
            className="input"
            required
          >
            <option value="">Select a resource...</option>
            {resources?.content.map(r => (
              <option key={r.id} value={r.id}>
                {resourceTypeIcon(r.type)} {r.name} — {r.location}
                {r.capacity ? ` (${r.capacity} people)` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Selected resource preview */}
        {selectedResource && (
          <div className="bg-brand-50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{resourceTypeIcon(selectedResource.type)}</div>
              <div>
                <div className="font-medium text-brand-800 dark:text-brand-200 text-sm">{selectedResource.name}</div>
                <div className="text-xs text-brand-500 dark:text-brand-400">{selectedResource.location}</div>
              </div>
            </div>
            {selectedResource.availableFrom && selectedResource.availableTo && (
              <div className="flex items-center gap-1.5 text-xs text-brand-500 dark:text-brand-400 mt-2">
                <Clock className="w-3 h-3" />
                Available: {formatTime(selectedResource.availableFrom)} – {formatTime(selectedResource.availableTo)}
              </div>
            )}
          </div>
        )}

        {/* Date */}
        <div>
          <label className="label">Date *</label>
          <input
            type="date"
            value={form.bookingDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => setForm(f => ({ ...f, bookingDate: e.target.value }))}
            className="input"
            required
          />
        </div>

        {/* Time range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Start Time *</label>
            <input
              type="time"
              value={form.startTime}
              onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">End Time *</label>
            <input
              type="time"
              value={form.endTime}
              onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
              className="input"
              required
            />
          </div>
        </div>

        {/* Purpose */}
        <div>
          <label className="label">Purpose *</label>
          <textarea
            value={form.purpose}
            onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
            placeholder="Describe the purpose of your booking..."
            className="input resize-none"
            rows={3}
            maxLength={500}
            required
          />
          <div className="text-right text-xs text-surface-400 mt-1">{form.purpose.length}/500</div>
        </div>

        {/* Expected attendees — only shown when resource has capacity */}
        {selectedResource?.capacity && (
          <div>
            <label className="label">Expected Attendees</label>
            <input
              type="number"
              value={form.expectedAttendees}
              onChange={e => setForm(f => ({ ...f, expectedAttendees: e.target.value }))}
              placeholder={`Max ${selectedResource.capacity}`}
              min={1}
              max={selectedResource.capacity}
              className="input"
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">
            {mutation.isPending
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Calendar className="w-4 h-4" />
            }
            Submit Booking Request
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
