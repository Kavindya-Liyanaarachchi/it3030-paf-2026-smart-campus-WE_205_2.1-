package com.smartcampus.dto.response;

import com.smartcampus.enums.NotificationType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private String id;
    private NotificationType type;
    private String title;
    private String message;
    private boolean read;
    private String referenceId;
    private String referenceType;
    private LocalDateTime createdAt;
}
