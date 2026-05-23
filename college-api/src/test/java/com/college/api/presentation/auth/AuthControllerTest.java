package com.college.api.presentation.auth;

import com.college.api.application.auth.AuthService;
import com.college.api.application.exception.InvalidCredentialsException;
import com.college.api.application.user.UserService;
import com.college.api.domain.user.UserRepository;
import com.college.api.infrastructure.config.SecurityConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
@org.springframework.test.context.TestPropertySource(properties = {
        "jwt.secret=test-secret-key-minimum-32-characters-long-enough-for-hs256",
        "jwt.expiration-ms=86400000",
        "cors.allowed-origins=http://localhost:3000",
        "app.frontend-url=http://localhost:3000",
        "app.admin.username=admin",
        "app.admin.email=admin@test.com",
        "app.admin.password=changeme"
})
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean AuthService authService;
    @MockBean UserService userService;
    @MockBean UserRepository userRepository;

    private static final AuthService.LoginResult MOCK_RESULT = new AuthService.LoginResult(
            "mock.jwt.token", 1, "alice", "alice@test.com", null, null, 1, "ADMIN",
            List.of("posts", "documents")
    );

    @Test
    void POST_login_withValidCredentials_returns200WithTokenAndUserData() throws Exception {
        when(authService.login("alice", "secret123")).thenReturn(MOCK_RESULT);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("alice", "secret123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").doesNotExist())
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.username").value("alice"))
                .andExpect(jsonPath("$.roleName").value("ADMIN"))
                .andExpect(jsonPath("$.permissions").isArray())
                .andExpect(jsonPath("$.permissions[0]").value("posts"));
    }

    @Test
    void POST_login_withInvalidCredentials_returns401() throws Exception {
        when(authService.login("alice", "wrong")).thenThrow(new InvalidCredentialsException());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("alice", "wrong"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void POST_login_withBlankFields_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }
}
