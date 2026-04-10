package com.smartcampus.service;

import com.smartcampus.dto.request.CommentRequest;
import com.smartcampus.dto.request.TicketRequest;
import com.smartcampus.dto.request.TicketUpdateRequest;
import com.smartcampus.dto.response.*;
import com.smartcampus.entity.*;
import com.smartcampus.enums.NotificationType;
import com.smartcampus.enums.TicketStatus;
import com.smartcampus.enums.UserRole;
import com.smartcampus.exception.*;
import com.smartcampus.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final IncidentTicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final UserRepository userRepository;
    private final ResourceService resourceService;
    private final NotificationService notificationService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.max-images-per-ticket:3}")
    private int maxImagesPerTicket;

    public TicketResponse createTicket(String userId, TicketRequest request) {
        User reporter = findUser(userId);
        IncidentTicket ticket = new IncidentTicket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setReporter(reporter);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setLocation(request.getLocation());
        ticket.setPreferredContactEmail(request.getPreferredContactEmail());
        ticket.setPreferredContactPhone(request.getPreferredContactPhone());
        if (request.getResourceId() != null && !request.getResourceId().isBlank()) {
            ticket.setResource(resourceService.findById(request.getResourceId()));
        }
        return toResponse(ticketRepository.save(ticket));
    }

    public TicketAttachmentResponse uploadAttachment(String ticketId, String userId, MultipartFile file) throws IOException {
        IncidentTicket ticket = findById(ticketId);
        User user = findUser(userId);

        boolean isStaff = user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.TECHNICIAN
            || user.getRole() == UserRole.MANAGER;
        if (!isStaff && !ticket.getReporter().getId().equals(userId)) {
            throw new ForbiddenException("You can only upload attachments to your own tickets");
        }
        if (attachmentRepository.countByTicketId(ticketId) >= maxImagesPerTicket) {
            throw new BadRequestException("Maximum " + maxImagesPerTicket + " attachments allowed per ticket");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Only image files are allowed");
        }

        Path uploadPath = Paths.get(uploadDir, "tickets", ticketId);
        Files.createDirectories(uploadPath);
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Files.copy(file.getInputStream(), uploadPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);

        TicketAttachment attachment = TicketAttachment.builder()
            .ticketId(ticketId)
            .fileName(file.getOriginalFilename())
            .filePath("/api/uploads/tickets/" + ticketId + "/" + fileName)
            .contentType(contentType)
            .fileSize(file.getSize())
            .build();

        return toAttachmentResponse(attachmentRepository.save(attachment));
    }

    public TicketResponse updateTicket(String ticketId, String userId, TicketUpdateRequest request) {
        IncidentTicket ticket = findById(ticketId);
        User user = findUser(userId);

        boolean isStaff = user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.TECHNICIAN
            || user.getRole() == UserRole.MANAGER;
        if (!isStaff) throw new ForbiddenException("Only admins or technicians can update ticket status");

        TicketStatus oldStatus = ticket.getStatus();
        if (request.getStatus() != null)          ticket.setStatus(request.getStatus());
        if (request.getResolutionNotes() != null)  ticket.setResolutionNotes(request.getResolutionNotes());
        if (request.getRejectionReason() != null)  ticket.setRejectionReason(request.getRejectionReason());

        if (request.getAssignedToId() != null && !request.getAssignedToId().isBlank()) {
            User assignee = findUser(request.getAssignedToId());
            ticket.setAssignedTo(assignee);
            notificationService.sendNotification(assignee.getId(),
                NotificationType.TICKET_ASSIGNED, "Ticket Assigned to You",
                "Ticket #" + ticketId + " '" + ticket.getTitle() + "' has been assigned to you.",
                ticketId, "TICKET");
        }

        ticket = ticketRepository.save(ticket);

        if (request.getStatus() != null && !request.getStatus().equals(oldStatus)) {
            notificationService.sendNotification(ticket.getReporter().getId(),
                NotificationType.TICKET_STATUS_CHANGED, "Ticket Status Updated",
                "Your ticket '" + ticket.getTitle() + "' status changed to " + ticket.getStatus(),
                ticketId, "TICKET");
        }
        return toResponse(ticket);
    }

    public TicketCommentResponse addComment(String ticketId, String userId, CommentRequest request) {
        IncidentTicket ticket = findById(ticketId);
        User author = findUser(userId);

        TicketComment comment = TicketComment.builder()
            .ticketId(ticketId).author(author)
            .content(request.getContent()).edited(false)
            .build();
        comment = commentRepository.save(comment);

        if (!author.getId().equals(ticket.getReporter().getId())) {
            notificationService.sendNotification(ticket.getReporter().getId(),
                NotificationType.TICKET_COMMENT_ADDED, "New Comment on Your Ticket",
                author.getName() + " commented on ticket '" + ticket.getTitle() + "'",
                ticketId, "TICKET");
        }
        if (ticket.getAssignedTo() != null && !author.getId().equals(ticket.getAssignedTo().getId())) {
            notificationService.sendNotification(ticket.getAssignedTo().getId(),
                NotificationType.TICKET_COMMENT_ADDED, "New Comment on Assigned Ticket",
                author.getName() + " commented on ticket '" + ticket.getTitle() + "'",
                ticketId, "TICKET");
        }
        return toCommentResponse(comment);
    }

    public TicketCommentResponse editComment(String commentId, String userId, CommentRequest request) {
        TicketComment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new ForbiddenException("You can only edit your own comments");
        }
        comment.setContent(request.getContent());
        comment.setEdited(true);
        return toCommentResponse(commentRepository.save(comment));
    }

    public void deleteComment(String commentId, String userId, boolean isAdmin) {
        TicketComment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
        if (!isAdmin && !comment.getAuthor().getId().equals(userId)) {
            throw new ForbiddenException("You can only delete your own comments");
        }
        commentRepository.delete(comment);
    }

    public TicketResponse getById(String id, String userId, boolean isAdmin) {
        IncidentTicket ticket = findById(id);
        // Admins and managers can always view any ticket
        if (isAdmin) return toResponse(ticket);
        // Check if user is the reporter
        if (ticket.getReporter().getId().equals(userId)) return toResponse(ticket);
        // Check if user is the assigned technician
        if (ticket.getAssignedTo() != null && ticket.getAssignedTo().getId().equals(userId)) return toResponse(ticket);
        // Check if user has staff role
        User user = findUser(userId);
        if (user.getRole() == UserRole.TECHNICIAN || user.getRole() == UserRole.MANAGER) return toResponse(ticket);
        throw new ForbiddenException("Access denied");
    }

    public List<TicketResponse> getUserTickets(String userId) {
        return ticketRepository.findByReporterIdOrderByCreatedAtDesc(userId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<TicketResponse> getAssignedTickets(String techId) {
        return ticketRepository.findByAssignedToIdOrderByCreatedAtDesc(techId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Page<TicketResponse> getAllTickets(TicketStatus status, String resourceId, int page, int size) {
        List<IncidentTicket> all = ticketRepository.findByOrderByCreatedAtDesc();
        List<TicketResponse> filtered = all.stream()
            .filter(t -> status == null || t.getStatus() == status)
            .filter(t -> resourceId == null || (t.getResource() != null && t.getResource().getId().equals(resourceId)))
            .map(this::toResponse)
            .collect(Collectors.toList());

        int total = filtered.size();
        int fromIndex = Math.min(page * size, total);
        int toIndex   = Math.min(fromIndex + size, total);
        return new PageImpl<>(filtered.subList(fromIndex, toIndex), PageRequest.of(page, size), total);
    }

    private IncidentTicket findById(String id) {
        return ticketRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
    }

    private User findUser(String userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }

    private UserResponse userToResponse(User u) {
        UserResponse r = new UserResponse();
        r.setId(u.getId()); r.setName(u.getName()); r.setEmail(u.getEmail());
        r.setPictureUrl(u.getPictureUrl()); r.setRole(u.getRole());
        return r;
    }

    private TicketAttachmentResponse toAttachmentResponse(TicketAttachment a) {
        TicketAttachmentResponse r = new TicketAttachmentResponse();
        r.setId(a.getId()); r.setFileName(a.getFileName()); r.setFilePath(a.getFilePath());
        r.setContentType(a.getContentType()); r.setFileSize(a.getFileSize()); r.setCreatedAt(a.getCreatedAt());
        return r;
    }

    private TicketCommentResponse toCommentResponse(TicketComment c) {
        TicketCommentResponse r = new TicketCommentResponse();
        r.setId(c.getId()); r.setContent(c.getContent()); r.setEdited(c.isEdited());
        r.setCreatedAt(c.getCreatedAt()); r.setUpdatedAt(c.getUpdatedAt());
        r.setAuthor(userToResponse(c.getAuthor()));
        return r;
    }

    public TicketResponse toResponse(IncidentTicket t) {
        TicketResponse r = new TicketResponse();
        r.setId(t.getId()); r.setTitle(t.getTitle()); r.setDescription(t.getDescription());
        r.setCategory(t.getCategory()); r.setPriority(t.getPriority()); r.setStatus(t.getStatus());
        r.setLocation(t.getLocation()); r.setResolutionNotes(t.getResolutionNotes());
        r.setRejectionReason(t.getRejectionReason());
        r.setPreferredContactEmail(t.getPreferredContactEmail());
        r.setPreferredContactPhone(t.getPreferredContactPhone());
        r.setCreatedAt(t.getCreatedAt()); r.setUpdatedAt(t.getUpdatedAt());
        r.setReporter(userToResponse(t.getReporter()));
        if (t.getAssignedTo() != null) r.setAssignedTo(userToResponse(t.getAssignedTo()));
        if (t.getResource() != null) r.setResource(resourceService.toResponse(t.getResource()));
        r.setAttachments(attachmentRepository.findByTicketId(t.getId())
            .stream().map(this::toAttachmentResponse).collect(Collectors.toList()));
        r.setComments(commentRepository.findByTicketIdOrderByCreatedAtAsc(t.getId())
            .stream().map(this::toCommentResponse).collect(Collectors.toList()));
        return r;
    }
}
