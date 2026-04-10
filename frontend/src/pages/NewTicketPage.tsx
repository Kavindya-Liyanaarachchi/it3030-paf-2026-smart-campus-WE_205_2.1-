import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '../api/tickets';
import { resourcesApi } from '../api/resources';
import { TicketCategory, TicketPriority } from '../types';
import { ArrowLeft, Flag , Upload, X, Image } from 'lucide-react';
import { formatFileSize } from '../utils';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

const CATEGORIES: TicketCategory[] = ['ELECTRICAL', 'PLUMBING', 'IT_EQUIPMENT', 'HVAC', 'STRUCTURAL', 'SAFETY', 'OTHER'];
const PRIORITIES: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function NewTicketPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '' as TicketCategory | '',
    priority: 'MEDIUM' as TicketPriority,
    resourceId: searchParams.get('resourceId') ?? '',   // String, not Number
    location: '',
    preferredContactEmail: '',
    preferredContactPhone: '',
  });
  const [files, setFiles] = useState<File[]>([]);

  const { data: resources } = useQuery({
    queryKey: ['resources', { size: 100 }],
    queryFn: () => resourcesApi.search({ size: 100 }),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const ticket = await ticketsApi.create({
        title: form.title,
        description: form.description,
        category: form.category as TicketCategory,
        priority: form.priority,
        resourceId: form.resourceId || undefined,      // empty string → undefined
        location: form.location || undefined,
        preferredContactEmail: form.preferredContactEmail || undefined,
        preferredContactPhone: form.preferredContactPhone || undefined,
      });
      for (const file of files) {
        await ticketsApi.uploadAttachment(ticket.id, file);
      }
      return ticket;
    },
    onSuccess: (ticket) => {
      toast.success('Ticket submitted!');
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      navigate(`/tickets/${ticket.id}`);
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Submission failed'),
  });

  const onDrop = useCallback((accepted: File[]) => {
    setFiles(prev => {
      const merged = [...prev, ...accepted];
      if (merged.length > 3) { toast.error('Maximum 3 images allowed'); return merged.slice(0, 3); }
      return merged;
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 3,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) return toast.error('Please select a category');
    mutation.mutate();
  };

  const priorityColors: Record<TicketPriority, string> = {
    LOW:      'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/30',
    MEDIUM:   'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30',
    HIGH:     'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30',
    CRITICAL: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30',
  };

  return (
    <div className="max-w-2xl space-y-6">
      <button onClick={() => navigate(-1)} className="btn-ghost text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div>
        <h1 className="font-display text-2xl font-700 text-surface-900 dark:text-white">Report an Issue</h1>
        <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
          Describe the problem and a technician will be assigned to resolve it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Brief description of the issue"
            className="input"
            maxLength={200}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category *</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value as TicketCategory }))}
              className="input"
              required
            >
              <option value="">Select category...</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <div className="grid grid-cols-2 gap-1.5">
              {PRIORITIES.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, priority: p }))}
                  className={`text-xs font-medium py-2 px-3 rounded-lg border-2 transition-all ${
                    form.priority === p
                      ? priorityColors[p] + ' border-current'
                      : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="label">Description *</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Provide details about the issue..."
            className="input resize-none"
            rows={4}
            maxLength={2000}
            required
          />
          <div className="text-right text-xs text-surface-400 mt-1">{form.description.length}/2000</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Related Resource</label>
            <select
              value={form.resourceId}
              onChange={e => setForm(f => ({ ...f, resourceId: e.target.value }))}  // string
              className="input"
            >
              <option value="">None / Not applicable</option>
              {resources?.content.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="e.g. Block A, Room 204"
              className="input"
            />
          </div>
        </div>

        {/* Image attachments */}
        <div>
          <label className="label">Evidence / Images (max 3)</label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-brand-400 bg-brand-50 dark:bg-brand-950/20'
                : 'border-surface-200 dark:border-surface-700 hover:border-brand-300 dark:hover:border-brand-700'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 text-surface-300 dark:text-surface-600 mx-auto mb-2" />
            <p className="text-sm text-surface-500 dark:text-surface-400">
              {isDragActive ? 'Drop images here...' : 'Drag & drop images, or click to browse'}
            </p>
            <p className="text-xs text-surface-400 mt-1">{files.length}/3 selected</p>
          </div>

          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-xl">
                  <Image className="w-4 h-4 text-surface-400 flex-shrink-0" />
                  <span className="text-xs text-surface-600 dark:text-surface-400 flex-1 truncate">{file.name}</span>
                  <span className="text-xs text-surface-400">{formatFileSize(file.size)}</span>
                  <button type="button" onClick={() => setFiles(f => f.filter((_, j) => j !== i))}
                    className="text-surface-400 hover:text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Preferred Contact Email</label>
            <input type="email" value={form.preferredContactEmail}
              onChange={e => setForm(f => ({ ...f, preferredContactEmail: e.target.value }))}
              placeholder="your@email.com" className="input" />
          </div>
          <div>
            <label className="label">Preferred Contact Phone</label>
            <input type="tel" value={form.preferredContactPhone}
              onChange={e => setForm(f => ({ ...f, preferredContactPhone: e.target.value }))}
              placeholder="+94 XX XXX XXXX" className="input" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">
            {mutation.isPending
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Flag  className="w-4 h-4" />}
            Submit Ticket
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
