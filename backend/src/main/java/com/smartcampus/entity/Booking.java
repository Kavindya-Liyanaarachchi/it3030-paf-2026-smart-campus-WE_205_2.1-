package com.smartcampus.entity;

import com.smartcampus.enums.BookingStatus;
import lombok.*;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalTime;

@Document(collection = "bookings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Booking extends BaseEntity {

    @DBRef
    private User user;

    @DBRef
    private Resource resource;

    @Indexed
    private LocalDate bookingDate;

    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private BookingStatus status = BookingStatus.PENDING;
    private String adminNote;

    @DBRef
    private User reviewedBy;
}
