package com.smartcampus.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import java.util.HashMap;
import java.util.Map;

public class ForceAccountSelectionResolver implements OAuth2AuthorizationRequestResolver {

    private final DefaultOAuth2AuthorizationRequestResolver defaultResolver;

    public ForceAccountSelectionResolver(ClientRegistrationRepository repo) {
        this.defaultResolver = new DefaultOAuth2AuthorizationRequestResolver(
            repo, "/oauth2/authorization"
        );
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        OAuth2AuthorizationRequest req = defaultResolver.resolve(request);
        return req != null ? addPromptParam(req) : null;
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        OAuth2AuthorizationRequest req = defaultResolver.resolve(request, clientRegistrationId);
        return req != null ? addPromptParam(req) : null;
    }

    private OAuth2AuthorizationRequest addPromptParam(OAuth2AuthorizationRequest request) {
        Map<String, Object> extraParams = new HashMap<>(request.getAdditionalParameters());
        // Force Google to always show the account selection screen
        extraParams.put("prompt", "select_account");

        return OAuth2AuthorizationRequest.from(request)
            .additionalParameters(extraParams)
            .build();
    }
}
