package com.smartcampus.dto.request;
import lombok.Data;

@Data
public class BookingReviewRequest {
    private boolean approved;
    private String adminNote;
}
