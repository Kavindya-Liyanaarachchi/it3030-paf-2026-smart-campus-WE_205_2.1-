package com.smartcampus.security;

import com.smartcampus.entity.User;
import com.smartcampus.enums.UserRole;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuth2UserService extends OidcUserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);

        try {
            String email     = oidcUser.getEmail();
            String googleId  = oidcUser.getSubject();
            // getFullName() and getPicture() can be null — handle safely
            String name       = oidcUser.getFullName() != null
                                  ? oidcUser.getFullName()
                                  : (oidcUser.getGivenName() != null
                                      ? oidcUser.getGivenName()
                                      : email.split("@")[0]);
            String pictureUrl = oidcUser.getPicture(); // null is fine

            log.debug("OAuth2 login attempt: email={}, name={}, googleId={}", email, name, googleId);

            if (email == null || email.isBlank()) {
                log.error("OAuth2 user has no email address");
                throw new OAuth2AuthenticationException("Email not provided by Google");
            }

            userRepository.findByEmail(email)
                .ifPresentOrElse(
                    existing -> {
                        existing.setName(name);
                        existing.setPictureUrl(pictureUrl);
                        existing.setGoogleId(googleId);
                        userRepository.save(existing);
                        log.info("OAuth2 login: existing user {} ({})", email, existing.getRole());
                    },
                    () -> {
                        User newUser = User.builder()
                            .email(email)
                            .name(name)
                            .pictureUrl(pictureUrl)
                            .googleId(googleId)
                            .role(UserRole.USER)
                            .enabled(true)
                            .build();
                        userRepository.save(newUser);
                        log.info("OAuth2 login: new user created {}", email);
                    }
                );

        } catch (OAuth2AuthenticationException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error processing OAuth2 user: {}", e.getMessage(), e);
            throw new OAuth2AuthenticationException("Failed to process OAuth2 user: " + e.getMessage());
        }

        return oidcUser;
    }
}
