import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { resourcesApi } from '../api/resources';
import { MapPin, Users, Clock, Calendar, ArrowLeft, Wrench } from 'lucide-react';
import { resourceStatusBadge, resourceTypeLabel, resourceTypeIcon, formatTime } from '../utils';

export default function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: resource, isLoading } = useQuery({
    queryKey: ['resource', id],
    queryFn: () => resourcesApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!resource) return <div className="text-center py-20 text-surface-400">Resource not found</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <button onClick={() => navigate(-1)} className="btn-ghost text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-3xl mb-2">{resourceTypeIcon(resource.type)}</div>
            <h1 className="font-display text-2xl font-700 text-surface-900 dark:text-white">{resource.name}</h1>
            <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">{resourceTypeLabel(resource.type)}</p>
          </div>
          <span className={resourceStatusBadge(resource.status)}>{resource.status.replace('_', ' ')}</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
            <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0" />
            <span>{resource.location}</span>
          </div>
          {resource.capacity && (
            <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
              <Users className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span>Capacity: {resource.capacity} people</span>
            </div>
          )}
          {resource.availableFrom && resource.availableTo && (
            <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
              <Clock className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span>{formatTime(resource.availableFrom)} – {formatTime(resource.availableTo)}</span>
            </div>
          )}
          {resource.model && (
            <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
              <Wrench className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span>{resource.model}</span>
            </div>
          )}
        </div>

        {resource.description && (
          <div className="mt-4 p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
            <p className="text-sm text-surface-600 dark:text-surface-300">{resource.description}</p>
          </div>
        )}

        {resource.status === 'ACTIVE' && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => navigate(`/bookings/new?resourceId=${resource.id}`)}
              className="btn-primary"
            >
              <Calendar className="w-4 h-4" /> Book This Resource
            </button>
            <button
              onClick={() => navigate(`/tickets/new?resourceId=${resource.id}`)}
              className="btn-secondary"
            >
              <Wrench className="w-4 h-4" /> Report Issue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
