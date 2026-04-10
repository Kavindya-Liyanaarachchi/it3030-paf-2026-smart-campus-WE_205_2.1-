package com.smartcampus.entity;

import com.smartcampus.enums.NotificationType;
import lombok.*;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification extends BaseEntity {

    @Indexed
    private String userId;

    private NotificationType type;
    private String title;
    private String message;
    private boolean read = false;
    private String referenceId;
    private String referenceType;
}
