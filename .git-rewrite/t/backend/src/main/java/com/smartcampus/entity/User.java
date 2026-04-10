package com.smartcampus.entity;

import com.smartcampus.enums.UserRole;
import lombok.*;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User extends BaseEntity {

    @Indexed(unique = true)
    private String email;

    private String name;

    private String pictureUrl;

    private String googleId;

    // For local email/password auth
    private String password;

    private boolean emailVerified = false;

    @Builder.Default
    private UserRole role = UserRole.USER;

    @Builder.Default
    private boolean enabled = true;

    // Auth provider: "google" or "local"
    @Builder.Default
    private String provider = "local";
}
