// Enums
export type ResourceType = 'LECTURE_HALL' | 'LAB' | 'MEETING_ROOM' | 'EQUIPMENT';
export type ResourceStatus = 'ACTIVE' | 'OUT_OF_SERVICE' | 'MAINTENANCE';
export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketCategory = 'ELECTRICAL' | 'PLUMBING' | 'IT_EQUIPMENT' | 'HVAC' | 'STRUCTURAL' | 'SAFETY' | 'OTHER';
export type UserRole = 'USER' | 'ADMIN' | 'TECHNICIAN' | 'MANAGER';
export type NotificationType =
  | 'BOOKING_APPROVED' | 'BOOKING_REJECTED' | 'BOOKING_CANCELLED'
  | 'TICKET_STATUS_CHANGED' | 'TICKET_ASSIGNED' | 'TICKET_COMMENT_ADDED'
  | 'TICKET_RESOLVED' | 'SYSTEM';

// All IDs are strings (MongoDB ObjectId)
export interface User {
  id: string;
  email: string;
  name: string;
  pictureUrl?: string;
  role: UserRole;
  enabled: boolean;
  createdAt: string;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  capacity?: number;
  location: string;
  building?: string;
  floor?: string;
  description?: string;
  status: ResourceStatus;
  availableFrom?: string;
  availableTo?: string;
  serialNumber?: string;
  model?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  user: User;
  resource: Resource;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  expectedAttendees?: number;
  status: BookingStatus;
  adminNote?: string;
  reviewedBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface TicketAttachment {
  id: string;
  fileName: string;
  filePath: string;
  contentType: string;
  fileSize: number;
  createdAt: string;
}

export interface TicketComment {
  id: string;
  author: User;
  content: string;
  edited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  reporter: User;
  resource?: Resource;
  location?: string;
  assignedTo?: User;
  resolutionNotes?: string;
  rejectionReason?: string;
  preferredContactEmail?: string;
  preferredContactPhone?: string;
  attachments: TicketAttachment[];
  comments: TicketComment[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
}

// API Response types
export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

// Form types — all IDs are strings
export interface BookingFormData {
  resourceId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  expectedAttendees?: number;
}

export interface TicketFormData {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  resourceId?: string;
  location?: string;
  preferredContactEmail?: string;
  preferredContactPhone?: string;
}

export interface ResourceFormData {
  name: string;
  type: ResourceType;
  capacity?: number;
  location: string;
  building?: string;
  floor?: string;
  description?: string;
  status: ResourceStatus;
  availableFrom?: string;
  availableTo?: string;
  serialNumber?: string;
  model?: string;
  imageUrl?: string;
}
