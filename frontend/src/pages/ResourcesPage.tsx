import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { resourcesApi } from '../api/resources';
import { ResourceStatus, ResourceType } from '../types';
import { Building2, Search, Filter, Plus, MapPin, Users, ChevronRight } from 'lucide-react';
import { resourceStatusBadge, resourceTypeLabel, resourceTypeIcon } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';

const TYPES: ResourceType[] = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];
const STATUSES: ResourceStatus[] = ['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE'];

export default function ResourcesPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN', 'MANAGER');

  const [search, setSearch] = useState('');
  const [type, setType] = useState<ResourceType | ''>('');
  const [status, setStatus] = useState<ResourceStatus | ''>('ACTIVE');
  const [minCapacity, setMinCapacity] = useState('');
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['resources', { type, status, minCapacity, page, search }],
    queryFn: () => resourcesApi.search({
      type: type || undefined,
      status: status || undefined,
      search: search || undefined,
      minCapacity: minCapacity ? parseInt(minCapacity) : undefined,
      page,
      size: 12,
    }),
  });

  const resources = data?.content ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-700 text-surface-900 dark:text-white">Resources</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
            Browse and book campus facilities and equipment
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => navigate('/resources/new')} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Resource
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search by name, location, building..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="input pl-9"
            />
          </div>

          <select
            value={type}
            onChange={e => { setType(e.target.value as ResourceType | ''); setPage(0); }}
            className="input w-auto"
          >
            <option value="">All Types</option>
            {TYPES.map(t => <option key={t} value={t}>{resourceTypeLabel(t)}</option>)}
          </select>

          <select
            value={status}
            onChange={e => { setStatus(e.target.value as ResourceStatus | ''); setPage(0); }}
            className="input w-auto"
          >
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>

          <input
            type="number"
            placeholder="Min capacity"
            value={minCapacity}
            onChange={e => { setMinCapacity(e.target.value); setPage(0); }}
            className="input w-36"
          />
        </div>

        {/* Type pills */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <button
            onClick={() => { setType(''); setPage(0); }}
            className={clsx('badge cursor-pointer transition-all', type === '' ? 'badge-blue' : 'badge-gray')}
          >
            All
          </button>
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => { setType(t); setPage(0); }}
              className={clsx('badge cursor-pointer transition-all', type === t ? 'badge-blue' : 'badge-gray')}
            >
              {resourceTypeIcon(t)} {resourceTypeLabel(t)}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-3/4 mb-3" />
              <div className="h-3 bg-surface-100 dark:bg-surface-800 rounded w-1/2 mb-2" />
              <div className="h-3 bg-surface-100 dark:bg-surface-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="card py-16 text-center">
          <Building2 className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
          <h3 className="font-medium text-surface-700 dark:text-surface-300 mb-1">No resources found</h3>
          <p className="text-sm text-surface-400">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <button
                key={resource.id}
                onClick={() => navigate(`/resources/${resource.id}`)}
                className="card p-5 text-left hover:shadow-card-hover transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-2xl">{resourceTypeIcon(resource.type)}</div>
                  <span className={resourceStatusBadge(resource.status)}>
                    {resource.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-display font-600 text-surface-900 dark:text-white text-sm mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {resource.name}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-surface-400 mb-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{resource.location}</span>
                </div>

                {resource.capacity && (
                  <div className="flex items-center gap-1.5 text-xs text-surface-400">
                    <Users className="w-3 h-3 flex-shrink-0" />
                    <span>Up to {resource.capacity} people</span>
                  </div>
                )}

                {resource.description && (
                  <p className="text-xs text-surface-400 mt-2 line-clamp-2">{resource.description}</p>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-100 dark:border-surface-800">
                  <span className="text-xs text-surface-400">{resourceTypeLabel(resource.type)}</span>
                  <ChevronRight className="w-4 h-4 text-surface-300 dark:text-surface-600 group-hover:text-brand-500 transition-colors" />
                </div>
              </button>
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page === 0}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Previous
              </button>
              <span className="text-sm text-surface-500">
                Page {page + 1} of {data.totalPages} · {data.totalElements} resources
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={data.last}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
