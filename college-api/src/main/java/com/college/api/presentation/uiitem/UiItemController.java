package com.college.api.presentation.uiitem;

import com.college.api.application.uiitem.UiItemService;
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

@Tag(name = "UI Items", description = "Named UI items that can be linked to permission objects")
@RestController
@RequestMapping("/api/ui-items")
@RequiredArgsConstructor
public class UiItemController {

    private final UiItemService service;

    @Operation(summary = "List all UI items")
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping
    public List<UiItemResponse> findAll() {
        return service.findAll().stream().map(UiItemResponse::from).toList();
    }

    @Operation(summary = "Get a UI item by name")
    @ApiResponse(responseCode = "200", description = "UI item found")
    @ApiResponse(responseCode = "404", description = "UI item not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/{name}")
    public UiItemResponse findById(@PathVariable String name) {
        return UiItemResponse.from(service.findById(name));
    }

    @Operation(summary = "Create a UI item")
    @ApiResponse(responseCode = "201", description = "UI item created")
    @ApiResponse(responseCode = "400", description = "Validation error",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "403", description = "Insufficient permissions",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @PreAuthorize("hasAuthority('admin_ui_item')")
    @PostMapping
    public ResponseEntity<UiItemResponse> create(@Valid @RequestBody UiItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(UiItemResponse.from(service.create(request.name())));
    }

    @Operation(summary = "Delete a UI item")
    @ApiResponse(responseCode = "204", description = "UI item deleted")
    @ApiResponse(responseCode = "404", description = "UI item not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "403", description = "Insufficient permissions",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @PreAuthorize("hasAuthority('admin_ui_item')")
    @DeleteMapping("/{name}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String name) {
        service.delete(name);
    }
}
