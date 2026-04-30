import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, notificationPreferencesApi } from '../api/notifications';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CheckCheck, Calendar, Flag, MessageSquare,
  Settings, ChevronDown, ChevronUp, Save,
} from 'lucide-react';
import { timeAgo } from '../utils';
import { NotificationType, NotificationPreference } from '../types';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const typeIcon = (type: NotificationType) => {
  if (type.startsWith('BOOKING')) return Calendar;
  if (type === 'TICKET_COMMENT_ADDED') return MessageSquare;
  return Flag;
};

const typeBg = (type: NotificationType) => {
  if (type.startsWith('BOOKING'))
    return 'bg-blue-100 dark:bg-blue-900/40 text-blue-500';
  if (type === 'TICKET_COMMENT_ADDED')
    return 'bg-purple-100 dark:bg-purple-900/40 text-purple-500';
  return 'bg-orange-100 dark:bg-orange-900/40 text-orange-500';
};

// ── Preference toggle component ───────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0',
        checked ? 'bg-brand-500' : 'bg-surface-300 dark:bg-surface-600'
      )}
    >
      <span className={clsx(
        'absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-white shadow transition-all duration-200',
        checked ? 'translate-x-5' : 'translate-x-0'
      )} />
    </button>
  );
}

// ── Preference row ────────────────────────────────────────────
function PrefRow({
  label, description, checked, onChange
}: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-surface-50 dark:border-surface-800 last:border-0">
      <div className="min-w-0">
        <div className="text-sm font-medium text-surface-800 dark:text-surface-200">{label}</div>
        <div className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">{description}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showPrefs, setShowPrefs] = useState(false);

  // Notifications list
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', 'all'],
    queryFn: notificationsApi.getAll,
  });

  // Preferences
  const { data: prefs, isLoading: prefsLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: notificationPreferencesApi.get,
  });

  const [localPrefs, setLocalPrefs] = useState<NotificationPreference | null>(null);
  const currentPrefs = localPrefs ?? prefs;

  const updatePref = (key: keyof NotificationPreference, value: boolean) => {
    if (!currentPrefs) return;
    setLocalPrefs({ ...currentPrefs, [key]: value });
  };

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  const savePrefs = useMutation({
    mutationFn: () => notificationPreferencesApi.update(currentPrefs!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      setLocalPrefs(null);
      toast.success('Preferences saved');
    },
    onError: () => toast.error('Failed to save preferences'),
  });

  const handleNotificationClick = (n: (typeof notifications)[0]) => {
    if (!n.read) markReadMutation.mutate(n.id);
    if (n.referenceType === 'BOOKING') navigate('/bookings');
    else if (n.referenceType === 'TICKET' && n.referenceId)
      navigate(`/tickets/${n.referenceId}`);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasUnsavedPrefs = localPrefs !== null;

  const prefGroups = [
    {
      title: 'Booking Notifications',
      icon: Calendar,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      items: [
        {
          key: 'bookingApproved' as keyof NotificationPreference,
          label: 'Booking Approved',
          description: 'When your booking request gets approved by an admin',
        },
        {
          key: 'bookingRejected' as keyof NotificationPreference,
          label: 'Booking Rejected',
          description: 'When your booking request is rejected with a reason',
        },
        {
          key: 'bookingCancelled' as keyof NotificationPreference,
          label: 'Booking Cancelled',
          description: 'When a booking is cancelled by you or an admin',
        },
      ],
    },
    {
      title: 'Ticket Notifications',
      icon: Flag,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      items: [
        {
          key: 'ticketStatusChanged' as keyof NotificationPreference,
          label: 'Status Changes',
          description: 'When your ticket status changes (e.g. Open → In Progress)',
        },
        {
          key: 'ticketAssigned' as keyof NotificationPreference,
          label: 'Ticket Assigned',
          description: 'When a technician is assigned to your ticket',
        },
        {
          key: 'ticketCommentAdded' as keyof NotificationPreference,
          label: 'New Comments',
          description: 'When someone comments on your ticket',
        },
        {
          key: 'ticketResolved' as keyof NotificationPreference,
          label: 'Ticket Resolved',
          description: 'When your ticket is marked as resolved',
        },
      ],
    },
    {
      title: 'System Notifications',
      icon: Bell,
      color: 'text-surface-500',
      bg: 'bg-surface-100 dark:bg-surface-800',
      items: [
        {
          key: 'systemNotifications' as keyof NotificationPreference,
          label: 'System Alerts',
          description: 'Important announcements and system messages',
        },
      ],
    },
  ];

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-700 text-surface-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllMutation.mutate()}
              className="btn-ghost text-sm"
              disabled={markAllMutation.isPending}
            >
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
          <button
            onClick={() => setShowPrefs(p => !p)}
            className={clsx(
              'btn-secondary text-sm',
              showPrefs && 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400'
            )}
          >
            <Settings className="w-4 h-4" />
            Preferences
            {showPrefs
              ? <ChevronUp className="w-3 h-3" />
              : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* ── Preferences Panel ─────────────────────────────────── */}
      {showPrefs && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 dark:border-surface-800">
            <div>
              <h2 className="font-display font-600 text-surface-900 dark:text-white text-sm">
                Notification Preferences
              </h2>
              <p className="text-xs text-surface-400 mt-0.5">
                Choose which notifications you want to receive
              </p>
            </div>
            {hasUnsavedPrefs && (
              <button
                onClick={() => savePrefs.mutate()}
                disabled={savePrefs.isPending}
                className="btn-primary text-xs px-3 py-1.5"
              >
                {savePrefs.isPending
                  ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Save className="w-3.5 h-3.5" />
                }
                Save
              </button>
            )}
          </div>

          {prefsLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-surface-100 dark:bg-surface-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-surface-100 dark:divide-surface-800">
              {prefGroups.map(group => {
                const Icon = group.icon;
                // Check if all items in group are enabled
                const allEnabled = group.items.every(
                  item => currentPrefs?.[item.key] !== false
                );
                const someEnabled = group.items.some(
                  item => currentPrefs?.[item.key] !== false
                );

                return (
                  <div key={group.title} className="px-5 py-4">
                    {/* Group header with bulk toggle */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center', group.bg)}>
                          <Icon className={clsx('w-3.5 h-3.5', group.color)} />
                        </div>
                        <span className="text-xs font-600 text-surface-700 dark:text-surface-300 uppercase tracking-wide">
                          {group.title}
                        </span>
                      </div>
                      {/* Enable/disable all in group */}
                      <button
                        onClick={() => {
                          group.items.forEach(item => updatePref(item.key, !allEnabled));
                        }}
                        className="text-[10px] text-brand-500 hover:underline"
                      >
                        {allEnabled ? 'Disable all' : 'Enable all'}
                      </button>
                    </div>

                    {/* Individual toggles */}
                    <div className="pl-9">
                      {group.items.map(item => (
                        <PrefRow
                          key={item.key}
                          label={item.label}
                          description={item.description}
                          checked={currentPrefs?.[item.key] !== false}
                          onChange={v => updatePref(item.key, v)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Save bar at bottom when unsaved changes */}
          {hasUnsavedPrefs && (
            <div className="flex items-center justify-between px-5 py-3 bg-brand-50 dark:bg-brand-950/20 border-t border-brand-100 dark:border-brand-900/30">
              <span className="text-xs text-brand-600 dark:text-brand-400">
                You have unsaved changes
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setLocalPrefs(null)}
                  className="btn-ghost text-xs px-3 py-1.5"
                >
                  Discard
                </button>
                <button
                  onClick={() => savePrefs.mutate()}
                  disabled={savePrefs.isPending}
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save changes
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Notifications List ────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse h-16" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card py-16 text-center">
          <Bell className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
          <h3 className="font-medium text-surface-700 dark:text-surface-300">No notifications</h3>
          <p className="text-sm text-surface-400 mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="card divide-y divide-surface-50 dark:divide-surface-800">
          {notifications.map((n) => {
            const Icon = typeIcon(n.type);
            return (
              <button
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={clsx(
                  'w-full flex items-start gap-4 p-4 text-left transition-colors',
                  'hover:bg-surface-50 dark:hover:bg-surface-800/50',
                  !n.read && 'bg-brand-50/50 dark:bg-brand-950/10'
                )}
              >
                <div className={clsx(
                  'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                  typeBg(n.type)
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={clsx(
                      'text-sm font-medium',
                      !n.read
                        ? 'text-surface-900 dark:text-white'
                        : 'text-surface-600 dark:text-surface-400'
                    )}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-surface-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
