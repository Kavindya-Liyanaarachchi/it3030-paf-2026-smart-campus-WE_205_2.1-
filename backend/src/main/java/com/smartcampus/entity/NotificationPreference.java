package com.smartcampus.entity;

import lombok.*;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notification_preferences")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationPreference extends BaseEntity {

    @Indexed(unique = true)
    private String userId;

    // Booking notifications
    private boolean bookingApproved = true;
    private boolean bookingRejected = true;
    private boolean bookingCancelled = true;

    // Ticket notifications
    private boolean ticketStatusChanged = true;
    private boolean ticketAssigned = true;
    private boolean ticketCommentAdded = true;
    private boolean ticketResolved = true;

    // System notifications
    private boolean systemNotifications = true;
}
