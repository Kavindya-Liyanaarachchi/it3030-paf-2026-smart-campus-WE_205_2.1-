import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { bookingsApi } from '../api/bookings';
import { ticketsApi } from '../api/tickets';
import { resourcesApi } from '../api/resources';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Flag , Building2, Plus, Clock,
  CheckCircle, XCircle, TrendingUp, ArrowRight,
} from 'lucide-react';
import {
  bookingStatusBadge, ticketStatusBadge, priorityBadge,
  formatDate, formatTime, timeAgo,
} from '../utils';
import clsx from 'clsx';

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const isAdmin = hasRole('ADMIN', 'MANAGER', 'TECHNICIAN');

  const { data: myBookings = [] } = useQuery({
    queryKey: ['bookings', 'my'],
    queryFn: bookingsApi.getMyBookings,
  });

  const { data: myTickets = [] } = useQuery({
    queryKey: ['tickets', 'my'],
    queryFn: ticketsApi.getMyTickets,
  });

  const { data: resources } = useQuery({
    queryKey: ['resources', { size: 100 }],
    queryFn: () => resourcesApi.search({ size: 100 }),
  });

  const { data: allBookings } = useQuery({
    queryKey: ['bookings', 'all', { page: 0 }],
    queryFn: () => bookingsApi.getAll({ page: 0, size: 5 }),
    enabled: isAdmin,
  });

  const { data: allTickets } = useQuery({
    queryKey: ['tickets', 'all', { page: 0 }],
    queryFn: () => ticketsApi.getAll({ page: 0, size: 5 }),
    enabled: isAdmin,
  });

  const pendingBookings = myBookings.filter(b => b.status === 'PENDING').length;
  const activeTickets = myTickets.filter(t => !['CLOSED', 'RESOLVED'].includes(t.status)).length;
  const resourceCount = resources?.totalElements ?? 0;

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = [
    {
      label: 'My Bookings',
      value: myBookings.length,
      sub: `${pendingBookings} pending`,
      icon: Calendar,
      color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
      onClick: () => navigate('/bookings'),
    },
    {
      label: 'My Tickets',
      value: myTickets.length,
      sub: `${activeTickets} active`,
      icon: Flag ,
      color: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-100 dark:bg-orange-900/50',
      onClick: () => navigate('/tickets'),
    },
    {
      label: 'Resources',
      value: resourceCount,
      sub: 'available',
      icon: Building2,
      color: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
      iconBg: 'bg-green-100 dark:bg-green-900/50',
      onClick: () => navigate('/resources'),
    },
  ];

  if (isAdmin) {
    stats.push({
      label: 'Pending Reviews',
      value: allBookings?.content.filter(b => b.status === 'PENDING').length ?? 0,
      sub: 'need attention',
      icon: Clock,
      color: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-100 dark:bg-purple-900/50',
      onClick: () => navigate('/bookings'),
    });
  }

  const quickActions = [
    { label: 'Book a Resource', icon: Calendar, to: '/bookings/new', color: 'btn-primary' },
    { label: 'Report Issue', icon: Flag , to: '/tickets/new', color: 'btn-secondary' },
    { label: 'Browse Resources', icon: Building2, to: '/resources', color: 'btn-secondary' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-700 text-surface-900 dark:text-white">
            {greetingTime()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
            Here's what's happening on campus today.
          </p>
        </div>
        <div className="hidden sm:flex gap-2">
          {quickActions.map(({ label, icon: Icon, to, color }) => (
            <button key={to} onClick={() => navigate(to)} className={color}>
              <Icon className="w-4 h-4" />
              <span className="hidden md:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, icon: Icon, iconBg, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="card p-5 flex items-start gap-4 text-left hover:shadow-card-hover transition-all group"
          >
            <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
              <Icon className="w-5 h-5 text-brand-500 dark:text-brand-400" />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-display font-700 text-surface-900 dark:text-white">{value}</div>
              <div className="text-xs font-medium text-surface-500 dark:text-surface-400">{label}</div>
              <div className="text-[10px] text-surface-400 dark:text-surface-500 mt-0.5">{sub}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-surface-300 dark:text-surface-600 ml-auto mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-surface-100 dark:border-surface-800">
            <h2 className="font-display font-600 text-surface-900 dark:text-white">Recent Bookings</h2>
            <button onClick={() => navigate('/bookings')} className="text-xs text-brand-500 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-surface-50 dark:divide-surface-800">
            {myBookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex items-center gap-3 p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                <div className="w-9 h-9 bg-brand-50 dark:bg-brand-950/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-brand-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                    {booking.resource.name}
                  </div>
                  <div className="text-xs text-surface-400 mt-0.5">
                    {formatDate(booking.bookingDate)} · {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                  </div>
                </div>
                <span className={bookingStatusBadge(booking.status)}>{booking.status}</span>
              </div>
            ))}
            {myBookings.length === 0 && (
              <div className="py-10 text-center">
                <Calendar className="w-8 h-8 text-surface-300 dark:text-surface-600 mx-auto mb-2" />
                <p className="text-sm text-surface-400">No bookings yet</p>
                <button onClick={() => navigate('/bookings/new')} className="btn-primary mt-3 text-xs px-3 py-1.5">
                  <Plus className="w-3 h-3" /> Book a Resource
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-surface-100 dark:border-surface-800">
            <h2 className="font-display font-600 text-surface-900 dark:text-white">My Tickets</h2>
            <button onClick={() => navigate('/tickets')} className="text-xs text-brand-500 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-surface-50 dark:divide-surface-800">
            {myTickets.slice(0, 5).map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                className="flex items-center gap-3 p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 bg-orange-50 dark:bg-orange-950/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Flag  className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                    {ticket.title}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={ticketStatusBadge(ticket.status)}>{ticket.status.replace('_', ' ')}</span>
                    <span className={priorityBadge(ticket.priority)}>{ticket.priority}</span>
                  </div>
                </div>
                <div className="text-[10px] text-surface-400 flex-shrink-0">{timeAgo(ticket.createdAt)}</div>
              </div>
            ))}
            {myTickets.length === 0 && (
              <div className="py-10 text-center">
                <CheckCircle className="w-8 h-8 text-surface-300 dark:text-surface-600 mx-auto mb-2" />
                <p className="text-sm text-surface-400">No tickets raised</p>
                <button onClick={() => navigate('/tickets/new')} className="btn-secondary mt-3 text-xs px-3 py-1.5">
                  <Plus className="w-3 h-3" /> Report an Issue
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin: pending bookings panel */}
      {isAdmin && allBookings && allBookings.content.filter(b => b.status === 'PENDING').length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-surface-100 dark:border-surface-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <h2 className="font-display font-600 text-surface-900 dark:text-white">Pending Booking Requests</h2>
            </div>
            <button onClick={() => navigate('/bookings')} className="text-xs text-brand-500 hover:underline flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-surface-50 dark:divide-surface-800">
            {allBookings.content.filter(b => b.status === 'PENDING').map((booking) => (
              <div key={booking.id} className="flex items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    <span className="text-brand-500">{booking.user.name}</span> → {booking.resource.name}
                  </div>
                  <div className="text-xs text-surface-400 mt-0.5">
                    {formatDate(booking.bookingDate)} · {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                  </div>
                  <div className="text-xs text-surface-500 mt-0.5 italic truncate">"{booking.purpose}"</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('/bookings')}
                    className="btn-primary text-xs px-3 py-1.5"
                  >
                    <CheckCircle className="w-3 h-3" /> Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
