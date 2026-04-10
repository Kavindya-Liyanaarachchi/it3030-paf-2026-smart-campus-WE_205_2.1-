package com.smartcampus.dto.response;

import com.smartcampus.enums.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TicketResponse {
    private String id;
    private String title;
    private String description;
    private TicketCategory category;
    private TicketPriority priority;
    private TicketStatus status;
    private UserResponse reporter;
    private ResourceResponse resource;
    private String location;
    private UserResponse assignedTo;
    private String resolutionNotes;
    private String rejectionReason;
    private String preferredContactEmail;
    private String preferredContactPhone;
    private List<TicketAttachmentResponse> attachments;
    private List<TicketCommentResponse> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
