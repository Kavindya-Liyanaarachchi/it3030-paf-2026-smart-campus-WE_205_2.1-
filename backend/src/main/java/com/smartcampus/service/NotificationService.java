package com.smartcampus.service;

import com.smartcampus.dto.response.NotificationResponse;
import com.smartcampus.entity.Notification;
import com.smartcampus.enums.NotificationType;
import com.smartcampus.exception.ForbiddenException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceService preferenceService;

    @Async
    public void sendNotification(String userId, NotificationType type, String title,
                                  String message, String referenceId, String referenceType) {
        // Check user preferences before sending
        if (!preferenceService.isEnabled(userId, type.name())) {
            log.debug("Notification suppressed for user {} — type {} is disabled", userId, type);
            return;
        }

        Notification n = Notification.builder()
            .userId(userId)
            .type(type)
            .title(title)
            .message(message)
            .referenceId(referenceId)
            .referenceType(referenceType)
            .read(false)
            .build();
        notificationRepository.save(n);
    }

    public List<NotificationResponse> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<NotificationResponse> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markAsRead(String notificationId, String userId) {
        Notification n = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        if (!n.getUserId().equals(userId)) {
            throw new ForbiddenException("You can only mark your own notifications as read");
        }
        n.setRead(true);
        notificationRepository.save(n);
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository
            .findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    private NotificationResponse toResponse(Notification n) {
        NotificationResponse r = new NotificationResponse();
        r.setId(n.getId());
        r.setType(n.getType());
        r.setTitle(n.getTitle());
        r.setMessage(n.getMessage());
        r.setRead(n.isRead());
        r.setReferenceId(n.getReferenceId());
        r.setReferenceType(n.getReferenceType());
        r.setCreatedAt(n.getCreatedAt());
        return r;
    }
}
