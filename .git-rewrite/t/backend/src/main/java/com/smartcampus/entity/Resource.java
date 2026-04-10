package com.smartcampus.entity;

import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalTime;

@Document(collection = "resources")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Resource extends BaseEntity {

    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private String building;
    private String floor;
    private String description;
    private ResourceStatus status = ResourceStatus.ACTIVE;
    private LocalTime availableFrom;
    private LocalTime availableTo;
    private String serialNumber;
    private String model;
    private String imageUrl;
}
