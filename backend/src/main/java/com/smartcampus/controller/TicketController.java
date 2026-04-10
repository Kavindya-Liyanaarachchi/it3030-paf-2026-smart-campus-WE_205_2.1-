package com.smartcampus.controller;

import com.smartcampus.dto.request.*;
import com.smartcampus.dto.response.*;
import com.smartcampus.enums.TicketStatus;
import com.smartcampus.security.CustomUserDetails;
import com.smartcampus.service.TicketService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Tag(name = "Tickets")
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<TicketResponse> create(@AuthenticationPrincipal CustomUserDetails u,
                                                  @Valid @RequestBody TicketRequest request) {
        return ResponseEntity.status(201).body(ticketService.createTicket(u.getId(), request));
    }

    @PostMapping(value = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketAttachmentResponse> uploadAttachment(@PathVariable String id,
                                                                      @AuthenticationPrincipal CustomUserDetails u,
                                                                      @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.status(201).body(ticketService.uploadAttachment(id, u.getId(), file));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','TECHNICIAN')")
    public ResponseEntity<TicketResponse> update(@PathVariable String id,
                                                  @AuthenticationPrincipal CustomUserDetails u,
                                                  @RequestBody TicketUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateTicket(id, u.getId(), request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getById(@PathVariable String id,
                                                   @AuthenticationPrincipal CustomUserDetails u) {
        boolean isAdmin = u.getAuthorities().stream().anyMatch(a -> a.getAuthority().contains("ADMIN") || a.getAuthority().contains("MANAGER"));
        return ResponseEntity.ok(ticketService.getById(id, u.getId(), isAdmin));
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketResponse>> getMyTickets(@AuthenticationPrincipal CustomUserDetails u) {
        return ResponseEntity.ok(ticketService.getUserTickets(u.getId()));
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','TECHNICIAN')")
    public ResponseEntity<List<TicketResponse>> getAssigned(@AuthenticationPrincipal CustomUserDetails u) {
        return ResponseEntity.ok(ticketService.getAssignedTickets(u.getId()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','TECHNICIAN')")
    public ResponseEntity<Page<TicketResponse>> getAll(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) String resourceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ticketService.getAllTickets(status, resourceId, page, size));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketCommentResponse> addComment(@PathVariable String id,
                                                             @AuthenticationPrincipal CustomUserDetails u,
                                                             @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.status(201).body(ticketService.addComment(id, u.getId(), request));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<TicketCommentResponse> editComment(@PathVariable String commentId,
                                                              @AuthenticationPrincipal CustomUserDetails u,
                                                              @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.ok(ticketService.editComment(commentId, u.getId(), request));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable String commentId,
                                               @AuthenticationPrincipal CustomUserDetails u) {
        boolean isAdmin = u.getAuthorities().stream().anyMatch(a -> a.getAuthority().contains("ADMIN"));
        ticketService.deleteComment(commentId, u.getId(), isAdmin);
        return ResponseEntity.noContent().build();
    }
}
