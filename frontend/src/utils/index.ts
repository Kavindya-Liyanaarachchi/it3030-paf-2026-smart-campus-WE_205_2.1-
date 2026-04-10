import { BookingStatus, ResourceStatus, ResourceType, TicketCategory, TicketPriority, TicketStatus } from '../types';

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// Status badge classes
export function bookingStatusBadge(status: BookingStatus) {
  const map: Record<BookingStatus, string> = {
    PENDING:   'badge-yellow',
    APPROVED:  'badge-green',
    REJECTED:  'badge-red',
    CANCELLED: 'badge-gray',
  };
  return map[status];
}

export function ticketStatusBadge(status: TicketStatus) {
  const map: Record<TicketStatus, string> = {
    OPEN:        'badge-blue',
    IN_PROGRESS: 'badge-yellow',
    RESOLVED:    'badge-green',
    CLOSED:      'badge-gray',
    REJECTED:    'badge-red',
  };
  return map[status];
}

export function priorityBadge(priority: TicketPriority) {
  const map: Record<TicketPriority, string> = {
    LOW:      'badge-gray',
    MEDIUM:   'badge-blue',
    HIGH:     'badge-yellow',
    CRITICAL: 'badge-red',
  };
  return map[priority];
}

export function resourceStatusBadge(status: ResourceStatus) {
  const map: Record<ResourceStatus, string> = {
    ACTIVE:          'badge-green',
    OUT_OF_SERVICE:  'badge-red',
    MAINTENANCE:     'badge-yellow',
  };
  return map[status];
}

export function resourceTypeLabel(type: ResourceType): string {
  const map: Record<ResourceType, string> = {
    LECTURE_HALL: 'Lecture Hall',
    LAB:          'Lab',
    MEETING_ROOM: 'Meeting Room',
    EQUIPMENT:    'Equipment',
  };
  return map[type];
}

export function categoryLabel(cat: TicketCategory): string {
  const map: Record<TicketCategory, string> = {
    ELECTRICAL: 'Electrical', PLUMBING: 'Plumbing',
    IT_EQUIPMENT: 'IT Equipment', HVAC: 'HVAC',
    STRUCTURAL: 'Structural', SAFETY: 'Safety', OTHER: 'Other',
  };
  return map[cat];
}

export function resourceTypeIcon(type: ResourceType): string {
  const map: Record<ResourceType, string> = {
    LECTURE_HALL: '🏛️',
    LAB:          '🔬',
    MEETING_ROOM: '🤝',
    EQUIPMENT:    '📷',
  };
  return map[type];
}
