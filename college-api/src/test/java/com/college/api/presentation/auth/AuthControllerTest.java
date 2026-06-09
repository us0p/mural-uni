package com.college.api.presentation.auth;

import com.college.api.application.auth.AuthService;
import com.college.api.application.exception.InvalidCredentialsException;
import com.college.api.application.user.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean AuthService authService;
    @MockBean UserService userService;

    private static final AuthService.LoginResult MOCK_RESULT = new AuthService.LoginResult(
            "mock.jwt.token", 1, "alice", "alice@test.com", null, null, 1, "admin"
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
                .andExpect(jsonPath("$.roleName").value("admin"))
                .andExpect(jsonPath("$.permissions").doesNotExist());
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
