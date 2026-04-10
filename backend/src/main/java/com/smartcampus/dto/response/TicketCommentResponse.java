package com.smartcampus.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TicketCommentResponse {
    private String id;
    private UserResponse author;
    private String content;
    private boolean edited;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
