package com.smartcampus.controller;

import com.smartcampus.dto.request.NotificationPreferenceRequest;
import com.smartcampus.dto.response.NotificationPreferenceResponse;
import com.smartcampus.dto.response.NotificationResponse;
import com.smartcampus.security.CustomUserDetails;
import com.smartcampus.service.NotificationPreferenceService;
import com.smartcampus.service.NotificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationPreferenceService preferenceService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getAll(
            @AuthenticationPrincipal CustomUserDetails u) {
        return ResponseEntity.ok(notificationService.getUserNotifications(u.getId()));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnread(
            @AuthenticationPrincipal CustomUserDetails u) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(u.getId()));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getCount(
            @AuthenticationPrincipal CustomUserDetails u) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(u.getId())));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails u) {
        notificationService.markAsRead(id, u.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal CustomUserDetails u) {
        notificationService.markAllAsRead(u.getId());
        return ResponseEntity.ok().build();
    }

    // ── Preferences ──────────────────────────────────────────────
    @GetMapping("/preferences")
    public ResponseEntity<NotificationPreferenceResponse> getPreferences(
            @AuthenticationPrincipal CustomUserDetails u) {
        return ResponseEntity.ok(preferenceService.getPreferences(u.getId()));
    }

    @PutMapping("/preferences")
    public ResponseEntity<NotificationPreferenceResponse> updatePreferences(
            @AuthenticationPrincipal CustomUserDetails u,
            @RequestBody NotificationPreferenceRequest request) {
        return ResponseEntity.ok(preferenceService.updatePreferences(u.getId(), request));
    }
}
