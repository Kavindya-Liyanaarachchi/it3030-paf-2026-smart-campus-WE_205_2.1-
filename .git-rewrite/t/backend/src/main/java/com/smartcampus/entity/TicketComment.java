package com.smartcampus.entity;

import lombok.*;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "ticket_comments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketComment extends BaseEntity {

    private String ticketId;

    @DBRef
    private User author;

    private String content;
    private boolean edited = false;
}
