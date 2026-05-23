package com.college.api.presentation.uiitem;

import com.college.api.application.uiitem.UiPermissionObjectService;
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

import java.util.List;

@Tag(name = "UI Item Permissions", description = "Assign and revoke permission objects on UI items")
@RestController
@RequestMapping("/api/ui-permission-objects")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('admin')")
public class UiPermissionObjectController {

    private final UiPermissionObjectService service;

    @Operation(summary = "List all UI item-permission assignments")
    @GetMapping
    public List<UiPermissionObjectResponse> findAll() {
        return service.findAll().stream().map(UiPermissionObjectResponse::from).toList();
    }

    @Operation(summary = "Get a UI item-permission assignment by ID")
    @ApiResponse(responseCode = "200", description = "Assignment found")
    @ApiResponse(responseCode = "404", description = "Assignment not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @GetMapping("/{id}")
    public UiPermissionObjectResponse findById(@PathVariable Integer id) {
        return UiPermissionObjectResponse.from(service.findById(id));
    }

    @Operation(summary = "List all permission assignments for a UI item")
    @GetMapping("/by-ui-item/{uiItemName}")
    public List<UiPermissionObjectResponse> findByUiItemName(@PathVariable String uiItemName) {
        return service.findByUiItemName(uiItemName).stream().map(UiPermissionObjectResponse::from).toList();
    }

    @Operation(summary = "Assign a permission object to a UI item")
    @ApiResponse(responseCode = "201", description = "Assignment created")
    @ApiResponse(responseCode = "400", description = "Validation error",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "404", description = "UI item or permission object not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @PostMapping
    public ResponseEntity<UiPermissionObjectResponse> create(@Valid @RequestBody UiPermissionObjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(UiPermissionObjectResponse.from(
                        service.create(request.uiItemName(), request.permissionId())));
    }

    @Operation(summary = "Remove a permission object from a UI item")
    @ApiResponse(responseCode = "204", description = "Assignment removed")
    @ApiResponse(responseCode = "404", description = "Assignment not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }
}
