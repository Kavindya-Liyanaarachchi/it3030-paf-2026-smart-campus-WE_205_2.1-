package com.smartcampus.dto.response;

import com.smartcampus.enums.UserRole;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserResponse {
    private String id;
    private String email;
    private String name;
    private String pictureUrl;
    private UserRole role;
    private boolean enabled;
    private LocalDateTime createdAt;
}
