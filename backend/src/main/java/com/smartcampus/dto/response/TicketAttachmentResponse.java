package com.smartcampus.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TicketAttachmentResponse {
    private String id;
    private String fileName;
    private String filePath;
    private String contentType;
    private Long fileSize;
    private LocalDateTime createdAt;
}
