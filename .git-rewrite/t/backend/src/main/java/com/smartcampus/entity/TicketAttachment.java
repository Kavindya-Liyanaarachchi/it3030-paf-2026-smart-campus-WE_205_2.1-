package com.smartcampus.entity;

import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "ticket_attachments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketAttachment extends BaseEntity {

    private String ticketId;
    private String fileName;
    private String filePath;
    private String contentType;
    private Long fileSize;
}
