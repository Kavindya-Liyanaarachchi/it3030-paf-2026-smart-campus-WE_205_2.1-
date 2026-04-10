package com.smartcampus.service;

import com.smartcampus.dto.request.NotificationPreferenceRequest;
import com.smartcampus.dto.response.NotificationPreferenceResponse;
import com.smartcampus.entity.NotificationPreference;
import com.smartcampus.repository.NotificationPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository preferenceRepository;

    public NotificationPreferenceResponse getPreferences(String userId) {
        NotificationPreference pref = preferenceRepository.findByUserId(userId)
            .orElseGet(() -> createDefault(userId));
        return toResponse(pref);
    }

    public NotificationPreferenceResponse updatePreferences(String userId,
                                                             NotificationPreferenceRequest request) {
        NotificationPreference pref = preferenceRepository.findByUserId(userId)
            .orElseGet(() -> {
                NotificationPreference p = new NotificationPreference();
                p.setUserId(userId);
                return p;
            });

        pref.setBookingApproved(request.isBookingApproved());
        pref.setBookingRejected(request.isBookingRejected());
        pref.setBookingCancelled(request.isBookingCancelled());
        pref.setTicketStatusChanged(request.isTicketStatusChanged());
        pref.setTicketAssigned(request.isTicketAssigned());
        pref.setTicketCommentAdded(request.isTicketCommentAdded());
        pref.setTicketResolved(request.isTicketResolved());
        pref.setSystemNotifications(request.isSystemNotifications());

        return toResponse(preferenceRepository.save(pref));
    }

    // Called by NotificationService before sending — checks if user wants this type
    public boolean isEnabled(String userId, String notificationType) {
        NotificationPreference pref = preferenceRepository.findByUserId(userId)
            .orElseGet(() -> createDefault(userId));

        return switch (notificationType) {
            case "BOOKING_APPROVED"      -> pref.isBookingApproved();
            case "BOOKING_REJECTED"      -> pref.isBookingRejected();
            case "BOOKING_CANCELLED"     -> pref.isBookingCancelled();
            case "TICKET_STATUS_CHANGED" -> pref.isTicketStatusChanged();
            case "TICKET_ASSIGNED"       -> pref.isTicketAssigned();
            case "TICKET_COMMENT_ADDED"  -> pref.isTicketCommentAdded();
            case "TICKET_RESOLVED"       -> pref.isTicketResolved();
            case "SYSTEM"                -> pref.isSystemNotifications();
            default                      -> true;
        };
    }

    private NotificationPreference createDefault(String userId) {
        NotificationPreference p = NotificationPreference.builder()
            .userId(userId)
            .bookingApproved(true).bookingRejected(true).bookingCancelled(true)
            .ticketStatusChanged(true).ticketAssigned(true)
            .ticketCommentAdded(true).ticketResolved(true)
            .systemNotifications(true)
            .build();
        return preferenceRepository.save(p);
    }

    private NotificationPreferenceResponse toResponse(NotificationPreference p) {
        NotificationPreferenceResponse r = new NotificationPreferenceResponse();
        r.setId(p.getId());
        r.setBookingApproved(p.isBookingApproved());
        r.setBookingRejected(p.isBookingRejected());
        r.setBookingCancelled(p.isBookingCancelled());
        r.setTicketStatusChanged(p.isTicketStatusChanged());
        r.setTicketAssigned(p.isTicketAssigned());
        r.setTicketCommentAdded(p.isTicketCommentAdded());
        r.setTicketResolved(p.isTicketResolved());
        r.setSystemNotifications(p.isSystemNotifications());
        return r;
    }
}
