package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.ResourceEntity;
import com.smartcampus.backend.model.ResourceStatus;
import com.smartcampus.backend.model.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ResourceRepository extends JpaRepository<ResourceEntity, Long> {

    @Query("SELECT r FROM ResourceEntity r " +
            "WHERE (:type IS NULL OR r.type = :type) " +
            "AND (:location IS NULL OR lower(r.location) LIKE lower(concat('%', :location, '%'))) " +
            "AND (:minCapacity IS NULL OR r.capacity >= :minCapacity) " +
            "AND (:status IS NULL OR r.status = :status)")
    List<ResourceEntity> search(
            @Param("type") ResourceType type,
            @Param("location") String location,
            @Param("minCapacity") Integer minCapacity,
            @Param("status") ResourceStatus status
    );
}
