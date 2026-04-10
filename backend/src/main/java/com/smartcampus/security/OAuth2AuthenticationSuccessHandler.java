package com.smartcampus.security;

import com.smartcampus.entity.User;
import com.smartcampus.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
        String email = oidcUser.getEmail();

        log.debug("OAuth2 success handler: email={}", email);

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            log.error("User not found after OAuth2 success: {}", email);
            getRedirectStrategy().sendRedirect(request, response,
                frontendUrl + "/login?error=user_not_found");
            return;
        }

        if (!user.isEnabled()) {
            log.warn("Disabled user attempted login: {}", email);
            getRedirectStrategy().sendRedirect(request, response,
                frontendUrl + "/login?error=account_disabled");
            return;
        }

        String token        = tokenProvider.generateToken(user);
        String refreshToken = tokenProvider.generateRefreshToken(user);

        String redirectUrl = UriComponentsBuilder
            .fromUriString(frontendUrl + "/oauth2/redirect")
            .queryParam("token", token)
            .queryParam("refreshToken", refreshToken)
            .build().toUriString();

        log.info("OAuth2 success: redirecting {} to frontend", email);
        clearAuthenticationAttributes(request);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
