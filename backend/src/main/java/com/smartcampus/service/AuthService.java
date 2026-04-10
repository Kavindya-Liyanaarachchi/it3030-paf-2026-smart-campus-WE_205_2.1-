package com.smartcampus.service;

import com.smartcampus.dto.request.LoginRequest;
import com.smartcampus.dto.request.RegisterRequest;
import com.smartcampus.dto.response.AuthResponse;
import com.smartcampus.dto.response.UserResponse;
import com.smartcampus.entity.User;
import com.smartcampus.enums.UserRole;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with this email already exists");
        }

        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail().toLowerCase().trim())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(UserRole.USER)
            .enabled(true)
            .provider("local")
            .emailVerified(false)
            .build();

        user = userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        String token        = tokenProvider.generateToken(user);
        String refreshToken = tokenProvider.generateRefreshToken(user);

        return AuthResponse.builder()
            .accessToken(token)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .user(toUserResponse(user))
            .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
            .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        // Block Google-only accounts from using password login
        if ("google".equals(user.getProvider()) || user.getPassword() == null) {
            throw new BadRequestException(
                "This account uses Google Sign-In. Please click 'Continue with Google'."
            );
        }

        if (!user.isEnabled()) {
            throw new BadRequestException("Your account has been disabled. Please contact support.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        log.info("User logged in: {}", user.getEmail());

        String token        = tokenProvider.generateToken(user);
        String refreshToken = tokenProvider.generateRefreshToken(user);

        return AuthResponse.builder()
            .accessToken(token)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .user(toUserResponse(user))
            .build();
    }

    private UserResponse toUserResponse(User u) {
        UserResponse r = new UserResponse();
        r.setId(u.getId());
        r.setEmail(u.getEmail());
        r.setName(u.getName());
        r.setPictureUrl(u.getPictureUrl());
        r.setRole(u.getRole());
        r.setEnabled(u.isEnabled());
        r.setCreatedAt(u.getCreatedAt());
        return r;
    }
}
