package com.college.api.presentation.user;

import com.college.api.application.user.UserService;
import com.college.api.infrastructure.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Users", description = "College user management")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserService service;

    @Operation(summary = "List users with optional search and pagination")
    @ApiResponse(responseCode = "200", description = "OK")
    @PreAuthorize("hasAnyAuthority('admin', 'professor')")
    @GetMapping
    public UserPageResponse findAll(
            @RequestParam(name = "search_param", required = false) @Size(max = 200) String searchParam,
            @RequestParam(defaultValue = "0") @PositiveOrZero int page,
            @RequestParam(defaultValue = "10") @Max(100) int size
    ) {
        return UserPageResponse.from(service.findFiltered(searchParam, page, size));
    }

    @Operation(summary = "List alunos with optional search by username, email, or RA")
    @ApiResponse(responseCode = "200", description = "OK")
    @PreAuthorize("hasAnyAuthority('admin', 'professor')")
    @GetMapping("/students")
    public UserPageResponse findStudents(
            @RequestParam(name = "search_param", required = false) @Size(max = 200) String searchParam,
            @RequestParam(defaultValue = "0") @PositiveOrZero int page,
            @RequestParam(defaultValue = "20") @Max(100) int size
    ) {
        return UserPageResponse.from(service.findStudents(searchParam, page, size));
    }

    @Operation(summary = "Get a user by ID")
    @ApiResponse(responseCode = "200", description = "User found")
    @ApiResponse(responseCode = "404", description = "User not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @PreAuthorize("hasAnyAuthority('admin', 'professor')")
    @GetMapping("/{id}")
    public UserResponse findById(@PathVariable Integer id) {
        return UserResponse.from(service.findById(id));
    }

    @Operation(summary = "Create a user — sends a set-password email via SES")
    @ApiResponse(responseCode = "201", description = "User created")
    @ApiResponse(responseCode = "400", description = "Validation error",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "404", description = "Role not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @PreAuthorize("hasAuthority('admin')")
    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody UserRequest request) {
        UserResponse response = UserResponse.from(service.create(
                request.username(), request.email(), request.phoneNumber(), request.roleId(), request.ra()));
        service.sendSetPasswordEmail(response.id(), request.email(), request.username());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Update a user")
    @ApiResponse(responseCode = "200", description = "User updated")
    @ApiResponse(responseCode = "400", description = "Validation error",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "404", description = "User or role not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @PreAuthorize("hasAuthority('admin')")
    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Integer id, @Valid @RequestBody UserRequest request) {
        return UserResponse.from(service.update(id,
                request.username(), request.email(), request.phoneNumber(), request.roleId(), request.ra()));
    }

    @Operation(summary = "Delete a user")
    @ApiResponse(responseCode = "204", description = "User deleted")
    @ApiResponse(responseCode = "403", description = "Cannot delete own account",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "404", description = "User not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @PreAuthorize("hasAuthority('admin')")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal principal) {
        service.delete(id, principal.userId());
    }
}
