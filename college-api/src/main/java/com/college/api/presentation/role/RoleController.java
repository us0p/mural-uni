package com.college.api.presentation.role;

import com.college.api.application.role.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Roles", description = "Role management")
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService service;

    @Operation(summary = "List roles with optional search and pagination")
    @ApiResponse(responseCode = "200", description = "OK")
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping
    public RolePageResponse findAll(
            @RequestParam(name = "search_param", required = false) @jakarta.validation.constraints.Size(max = 200) String searchParam,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") @jakarta.validation.constraints.Max(100) int size
    ) {
        return RolePageResponse.from(service.findFiltered(searchParam, page, size));
    }

    @Operation(summary = "Get a role by ID")
    @ApiResponse(responseCode = "200", description = "Role found")
    @ApiResponse(responseCode = "404", description = "Role not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/{id}")
    public RoleResponse findById(@PathVariable Integer id) {
        return RoleResponse.from(service.findById(id));
    }

    @PreAuthorize("hasAuthority('admin')")
    @Operation(summary = "Create a role")
    @ApiResponse(responseCode = "201", description = "Role created")
    @ApiResponse(responseCode = "400", description = "Validation error",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @PostMapping
    public ResponseEntity<RoleResponse> create(@Valid @RequestBody RoleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(RoleResponse.from(service.create(request.name())));
    }

    @PreAuthorize("hasAuthority('admin')")
    @Operation(summary = "Update a role's name")
    @ApiResponse(responseCode = "200", description = "Role updated")
    @ApiResponse(responseCode = "400", description = "Validation error",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "404", description = "Role not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @PutMapping("/{id}")
    public RoleResponse update(@PathVariable Integer id, @Valid @RequestBody RoleRequest request) {
        return RoleResponse.from(service.update(id, request.name()));
    }

    @PreAuthorize("hasAuthority('admin')")
    @Operation(summary = "Delete a role")
    @ApiResponse(responseCode = "204", description = "Role deleted")
    @ApiResponse(responseCode = "404", description = "Role not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }
}
