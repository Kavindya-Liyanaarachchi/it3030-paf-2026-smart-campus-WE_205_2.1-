package com.smartcampus.entity;

import com.smartcampus.enums.TicketCategory;
import com.smartcampus.enums.TicketPriority;
import com.smartcampus.enums.TicketStatus;
import lombok.*;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "incident_tickets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IncidentTicket extends BaseEntity {

    private String title;
    private String description;
    private TicketCategory category;
    private TicketPriority priority = TicketPriority.MEDIUM;
    private TicketStatus status = TicketStatus.OPEN;

    @DBRef
    private User reporter;

    @DBRef
    private Resource resource;

    private String location;

    @DBRef
    private User assignedTo;

    private String resolutionNotes;
    private String rejectionReason;
    private String preferredContactEmail;
    private String preferredContactPhone;
}
