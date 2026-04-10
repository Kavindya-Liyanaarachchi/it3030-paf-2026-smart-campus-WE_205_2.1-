package com.smartcampus.dto.response;

import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class ResourceResponse {
    private String id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private String building;
    private String floor;
    private String description;
    private ResourceStatus status;
    private LocalTime availableFrom;
    private LocalTime availableTo;
    private String serialNumber;
    private String model;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
