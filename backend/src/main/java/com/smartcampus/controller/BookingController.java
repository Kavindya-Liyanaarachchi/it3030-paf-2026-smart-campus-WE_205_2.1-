package com.smartcampus.controller;

import com.smartcampus.dto.request.BookingRequest;
import com.smartcampus.dto.request.BookingReviewRequest;
import com.smartcampus.dto.response.BookingResponse;
import com.smartcampus.enums.BookingStatus;
import com.smartcampus.security.CustomUserDetails;
import com.smartcampus.service.BookingService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> create(@AuthenticationPrincipal CustomUserDetails u,
                                                   @Valid @RequestBody BookingRequest request) {
        return ResponseEntity.status(201).body(bookingService.createBooking(u.getId(), request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(@AuthenticationPrincipal CustomUserDetails u) {
        return ResponseEntity.ok(bookingService.getUserBookings(u.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getById(@PathVariable String id,
                                                    @AuthenticationPrincipal CustomUserDetails u) {
        boolean isAdmin = u.getAuthorities().stream().anyMatch(a -> a.getAuthority().contains("ADMIN") || a.getAuthority().contains("MANAGER"));
        return ResponseEntity.ok(bookingService.getById(id, u.getId(), isAdmin));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Page<BookingResponse>> getAll(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(bookingService.getAllBookings(status, resourceId, date, page, size));
    }

    @PostMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<BookingResponse> review(@PathVariable String id,
                                                   @AuthenticationPrincipal CustomUserDetails u,
                                                   @RequestBody BookingReviewRequest request) {
        return ResponseEntity.ok(bookingService.reviewBooking(id, u.getId(), request));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancel(@PathVariable String id,
                                                   @AuthenticationPrincipal CustomUserDetails u) {
        boolean isAdmin = u.getAuthorities().stream().anyMatch(a -> a.getAuthority().contains("ADMIN") || a.getAuthority().contains("MANAGER"));
        return ResponseEntity.ok(bookingService.cancelBooking(id, u.getId(), isAdmin));
    }
}
