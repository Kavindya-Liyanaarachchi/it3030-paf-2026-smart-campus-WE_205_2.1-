package com.smartcampus.repository;

import com.smartcampus.entity.IncidentTicket;
import com.smartcampus.enums.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentTicketRepository extends MongoRepository<IncidentTicket, String> {
    List<IncidentTicket> findByReporterIdOrderByCreatedAtDesc(String reporterId);
    List<IncidentTicket> findByAssignedToIdOrderByCreatedAtDesc(String technicianId);
    List<IncidentTicket> findByStatusOrderByCreatedAtDesc(TicketStatus status);
    List<IncidentTicket> findByOrderByCreatedAtDesc();
}
