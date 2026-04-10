package com.smartcampus.dto.response;

import lombok.Data;

@Data
public class NotificationPreferenceResponse {
    private String id;
    private boolean bookingApproved;
    private boolean bookingRejected;
    private boolean bookingCancelled;
    private boolean ticketStatusChanged;
    private boolean ticketAssigned;
    private boolean ticketCommentAdded;
    private boolean ticketResolved;
    private boolean systemNotifications;
}
