package com.smartcampus.dto.request;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalTime;

@Data
public class ResourceRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 200)
    private String name;

    @NotNull(message = "Type is required")
    private ResourceType type;

    @Min(value = 1)
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String building;
    private String floor;

    @Size(max = 1000)
    private String description;

    private ResourceStatus status = ResourceStatus.ACTIVE;
    private LocalTime availableFrom;
    private LocalTime availableTo;
    private String serialNumber;
    private String model;
    private String imageUrl;
}
