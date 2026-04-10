package com.smartcampus.service;

import com.smartcampus.dto.request.BookingRequest;
import com.smartcampus.dto.request.BookingReviewRequest;
import com.smartcampus.dto.response.BookingResponse;
import com.smartcampus.dto.response.UserResponse;
import com.smartcampus.entity.Booking;
import com.smartcampus.entity.Resource;
import com.smartcampus.entity.User;
import com.smartcampus.enums.BookingStatus;
import com.smartcampus.enums.NotificationType;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.exception.*;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ResourceService resourceService;
    private final NotificationService notificationService;

    public BookingResponse createBooking(String userId, BookingRequest request) {
        User user = findUser(userId);
        Resource resource = resourceService.findById(request.getResourceId());

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new BadRequestException("Resource is not available for booking");
        }
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            resource.getId(), request.getBookingDate(),
            request.getStartTime(), request.getEndTime());

        if (!conflicts.isEmpty()) {
            throw new ConflictException("Resource is already booked for this time slot");
        }

        Booking booking = Booking.builder()
            .user(user).resource(resource)
            .bookingDate(request.getBookingDate())
            .startTime(request.getStartTime())
            .endTime(request.getEndTime())
            .purpose(request.getPurpose())
            .expectedAttendees(request.getExpectedAttendees())
            .status(BookingStatus.PENDING)
            .build();

        return toResponse(bookingRepository.save(booking));
    }

    public BookingResponse reviewBooking(String bookingId, String adminId, BookingReviewRequest request) {
        Booking booking = findById(bookingId);
        User admin = findUser(adminId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be reviewed");
        }

        booking.setStatus(request.isApproved() ? BookingStatus.APPROVED : BookingStatus.REJECTED);
        booking.setAdminNote(request.getAdminNote());
        booking.setReviewedBy(admin);
        booking = bookingRepository.save(booking);

        NotificationType type = request.isApproved()
            ? NotificationType.BOOKING_APPROVED : NotificationType.BOOKING_REJECTED;
        String msg = String.format("Your booking for '%s' on %s has been %s.%s",
            booking.getResource().getName(), booking.getBookingDate(),
            request.isApproved() ? "approved" : "rejected",
            request.getAdminNote() != null ? " Note: " + request.getAdminNote() : "");

        notificationService.sendNotification(booking.getUser().getId(), type,
            request.isApproved() ? "Booking Approved" : "Booking Rejected",
            msg, booking.getId(), "BOOKING");

        return toResponse(booking);
    }

    public BookingResponse cancelBooking(String bookingId, String userId, boolean isAdmin) {
        Booking booking = findById(bookingId);

        if (!isAdmin && !booking.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only cancel your own bookings");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);

        if (!booking.getUser().getId().equals(userId)) {
            notificationService.sendNotification(booking.getUser().getId(),
                NotificationType.BOOKING_CANCELLED, "Booking Cancelled",
                "Your booking for '" + booking.getResource().getName() + "' was cancelled by admin.",
                booking.getId(), "BOOKING");
        }
        return toResponse(booking);
    }

    public List<BookingResponse> getUserBookings(String userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Page<BookingResponse> getAllBookings(BookingStatus status, String resourceId,
                                                LocalDate date, int page, int size) {
        List<Booking> all = bookingRepository.findByOrderByCreatedAtDesc();
        List<BookingResponse> filtered = all.stream()
            .filter(b -> status == null || b.getStatus() == status)
            .filter(b -> resourceId == null || b.getResource().getId().equals(resourceId))
            .filter(b -> date == null || b.getBookingDate().equals(date))
            .map(this::toResponse)
            .collect(Collectors.toList());

        int total = filtered.size();
        int fromIndex = Math.min(page * size, total);
        int toIndex   = Math.min(fromIndex + size, total);
        return new PageImpl<>(filtered.subList(fromIndex, toIndex), PageRequest.of(page, size), total);
    }

    public BookingResponse getById(String id, String userId, boolean isAdmin) {
        Booking booking = findById(id);
        if (!isAdmin && !booking.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }
        return toResponse(booking);
    }

    private Booking findById(String id) {
        return bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
    }

    private User findUser(String userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }

    public BookingResponse toResponse(Booking b) {
        BookingResponse r = new BookingResponse();
        r.setId(b.getId());
        r.setBookingDate(b.getBookingDate());
        r.setStartTime(b.getStartTime());
        r.setEndTime(b.getEndTime());
        r.setPurpose(b.getPurpose());
        r.setExpectedAttendees(b.getExpectedAttendees());
        r.setStatus(b.getStatus());
        r.setAdminNote(b.getAdminNote());
        r.setCreatedAt(b.getCreatedAt());
        r.setUpdatedAt(b.getUpdatedAt());
        r.setResource(resourceService.toResponse(b.getResource()));
        r.setUser(userToResponse(b.getUser()));
        if (b.getReviewedBy() != null) r.setReviewedBy(userToResponse(b.getReviewedBy()));
        return r;
    }

    private UserResponse userToResponse(User u) {
        UserResponse r = new UserResponse();
        r.setId(u.getId()); r.setName(u.getName()); r.setEmail(u.getEmail());
        r.setPictureUrl(u.getPictureUrl()); r.setRole(u.getRole());
        return r;
    }
}
