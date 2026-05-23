package com.college.api.presentation.auth;

import com.college.api.application.auth.AuthService;
import com.college.api.application.user.UserService;
import com.college.api.domain.user.User;
import com.college.api.infrastructure.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Auth", description = "Authentication")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Operation(summary = "Login and receive a JWT token")
    @SecurityRequirements
    @ApiResponse(responseCode = "200", description = "Login successful")
    @ApiResponse(responseCode = "401", description = "Invalid credentials",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request,
                               HttpServletResponse response) {
        AuthService.LoginResult result = authService.login(request.username(), request.password());
        setTokenCookie(response, result.token());
        return new LoginResponse(
                result.userId(),
                result.username(),
                result.email(),
                result.phoneNumber(),
                result.ra(),
                result.roleId(),
                result.roleName(),
                result.permissions()
        );
    }

    @Operation(summary = "Get current authenticated user info (validates session cookie)")
    @ApiResponse(responseCode = "200", description = "Session is valid")
    @ApiResponse(responseCode = "401", description = "No valid session")
    @GetMapping("/me")
    public LoginResponse me(Authentication authentication, HttpServletResponse response) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userService.findById(principal.userId());
        List<String> permissions = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();
        String freshToken = authService.reissueToken(
                principal.username(), principal.userId(), user.getRole().getName(), permissions, user.getTokenVersion());
        setTokenCookie(response, freshToken);
        return new LoginResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRa(),
                user.getRole().getId(),
                user.getRole().getName(),
                permissions
        );
    }

    @Operation(summary = "Request a password-reset email")
    @SecurityRequirements
    @ApiResponse(responseCode = "204", description = "Request received — email sent if address is registered")
    @PostMapping("/forgot-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestPasswordReset(request.email());
    }

    @Operation(summary = "Set password using a one-time token sent by email")
    @SecurityRequirements
    @ApiResponse(responseCode = "204", description = "Password set successfully")
    @ApiResponse(responseCode = "400", description = "Token inválido, expirado ou já utilizado",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @PostMapping("/set-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void setPassword(@Valid @RequestBody SetPasswordRequest request) {
        authService.setPassword(request.token(), request.password());
    }

    @Operation(summary = "Logout — clears the session cookie and invalidates the token")
    @SecurityRequirements
    @PostMapping("/logout")
    public void logout(HttpServletResponse response, Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            authService.invalidateSessions(principal.userId());
        }
        response.addHeader("Set-Cookie",
                "token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0");
    }

    private void setTokenCookie(HttpServletResponse response, String token) {
        String cookie = "token=" + token
                + "; HttpOnly"
                + "; Secure"
                + "; SameSite=Strict"
                + "; Path=/"
                + "; Max-Age=" + (jwtExpirationMs / 1000);
        response.addHeader("Set-Cookie", cookie);
    }
}
