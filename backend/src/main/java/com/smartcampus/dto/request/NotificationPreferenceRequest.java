package com.smartcampus.dto.request;

import lombok.Data;

@Data
public class NotificationPreferenceRequest {
    private boolean bookingApproved;
    private boolean bookingRejected;
    private boolean bookingCancelled;
    private boolean ticketStatusChanged;
    private boolean ticketAssigned;
    private boolean ticketCommentAdded;
    private boolean ticketResolved;
    private boolean systemNotifications;
}
