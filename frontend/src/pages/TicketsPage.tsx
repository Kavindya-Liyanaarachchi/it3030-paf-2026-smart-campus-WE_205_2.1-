import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ticketsApi } from '../api/tickets';
import { TicketStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Flag , Plus, ChevronRight } from 'lucide-react';
import { ticketStatusBadge, priorityBadge, categoryLabel, timeAgo } from '../utils';
import clsx from 'clsx';

const STATUS_TABS: { label: string; value: TicketStatus | 'ALL' }[] = [
  { label: 'All',         value: 'ALL'         },
  { label: 'Open',        value: 'OPEN'        },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved',    value: 'RESOLVED'    },
  { label: 'Closed',      value: 'CLOSED'      },
];

// Show last 8 chars of MongoDB ObjectId as a short ticket number
function shortId(id: string) {
  return id.length > 8 ? id.slice(-8).toUpperCase() : id.toUpperCase();
}

export default function TicketsPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isStaff = hasRole('ADMIN', 'MANAGER', 'TECHNICIAN');
  const [tab, setTab] = useState<'MY' | 'ALL' | 'ASSIGNED'>('MY');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(0);

  const { data: myTickets = [], isLoading: myLoading } = useQuery({
    queryKey: ['tickets', 'my'],
    queryFn: ticketsApi.getMyTickets,
    enabled: tab === 'MY',
  });

  const { data: assignedTickets = [], isLoading: assignedLoading } = useQuery({
    queryKey: ['tickets', 'assigned'],
    queryFn: ticketsApi.getAssigned,
    enabled: tab === 'ASSIGNED' && isStaff,
  });

  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ['tickets', 'all', { status: statusFilter, page }],
    queryFn: () => ticketsApi.getAll({
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      page,
      size: 20,
    }),
    enabled: tab === 'ALL' && isStaff,
  });

  let tickets = tab === 'MY' ? myTickets : tab === 'ASSIGNED' ? assignedTickets : (allData?.content ?? []);
  const isLoading = tab === 'MY' ? myLoading : tab === 'ASSIGNED' ? assignedLoading : allLoading;

  // Client-side status filter for MY and ASSIGNED tabs
  if ((tab === 'MY' || tab === 'ASSIGNED') && statusFilter !== 'ALL') {
    tickets = tickets.filter(t => t.status === statusFilter);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-700 text-surface-900 dark:text-white">Tickets</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
            Track maintenance and incident reports
          </p>
        </div>
        <button onClick={() => navigate('/tickets/new')} className="btn-primary">
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      {/* View tabs — only shown to staff */}
      {isStaff && (
        <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl w-fit">
          {[
            { label: 'My Tickets',      value: 'MY'       as const },
            { label: 'Assigned to Me',  value: 'ASSIGNED' as const },
            { label: 'All Tickets',     value: 'ALL'      as const },
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => { setTab(value); setPage(0); }}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                tab === value
                  ? 'bg-white dark:bg-surface-900 text-surface-900 dark:text-white shadow-sm'
                  : 'text-surface-500 dark:text-surface-400 hover:text-surface-700'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => { setStatusFilter(value as TicketStatus | 'ALL'); setPage(0); }}
            className={clsx(
              'badge cursor-pointer transition-all',
              statusFilter === value ? 'badge-blue' : 'badge-gray'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Ticket list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse h-24" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="card py-16 text-center">
          <Flag  className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
          <h3 className="font-medium text-surface-700 dark:text-surface-300 mb-1">No tickets found</h3>
          <button onClick={() => navigate('/tickets/new')} className="btn-primary mt-3 text-sm">
            <Plus className="w-4 h-4" /> Report an Issue
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              className="card p-4 w-full text-left hover:shadow-card-hover transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-orange-50 dark:bg-orange-950/30 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Flag  className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-medium text-surface-900 dark:text-surface-100 text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {/* Short readable ticket number instead of full ObjectId */}
                      <span className="text-surface-400 dark:text-surface-500 font-mono text-xs mr-1.5">
                        #{shortId(ticket.id)}
                      </span>
                      {ticket.title}
                    </h3>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <span className={ticketStatusBadge(ticket.status)}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className={priorityBadge(ticket.priority)}>
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-surface-400 flex-wrap">
                    <span>{categoryLabel(ticket.category)}</span>
                    {ticket.resource && <span>· {ticket.resource.name}</span>}
                    {isStaff && <span>· By {ticket.reporter.name}</span>}
                    {ticket.assignedTo && <span>· Assigned: {ticket.assignedTo.name}</span>}
                  </div>
                  <p className="text-xs text-surface-400 mt-1 line-clamp-1 italic">{ticket.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-surface-400">{timeAgo(ticket.createdAt)}</span>
                  <ChevronRight className="w-4 h-4 text-surface-300 dark:text-surface-600 group-hover:text-brand-500 transition-colors" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination — only for All Tickets tab */}
      {tab === 'ALL' && allData && allData.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="btn-secondary text-xs px-3 py-1.5">
            Previous
          </button>
          <span className="text-sm text-surface-500">Page {page + 1} of {allData.totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={allData.last} className="btn-secondary text-xs px-3 py-1.5">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
