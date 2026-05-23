package com.college.api.presentation.notice;

import com.college.api.application.notice.NoticeCategoryService;
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

@Tag(name = "Notice Categories", description = "Notice category management")
@RestController
@RequestMapping("/api/notice-categories")
@RequiredArgsConstructor
public class NoticeCategoryController {

    private final NoticeCategoryService service;

    @Operation(summary = "List all notice categories")
    @GetMapping
    public List<NoticeCategoryResponse> findAll() {
        return service.findAll().stream().map(NoticeCategoryResponse::from).toList();
    }

    @Operation(summary = "Get a notice category by ID")
    @ApiResponse(responseCode = "200", description = "Category found")
    @ApiResponse(responseCode = "404", description = "Category not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @GetMapping("/{id}")
    public NoticeCategoryResponse findById(@PathVariable Integer id) {
        return NoticeCategoryResponse.from(service.findById(id));
    }

    @PreAuthorize("hasAuthority('admin')")
    @Operation(summary = "Create a notice category")
    @ApiResponse(responseCode = "201", description = "Category created")
    @ApiResponse(responseCode = "400", description = "Validation error",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @PostMapping
    public ResponseEntity<NoticeCategoryResponse> create(@Valid @RequestBody NoticeCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(NoticeCategoryResponse.from(service.create(request.name())));
    }

    @PreAuthorize("hasAuthority('admin')")
    @Operation(summary = "Update a notice category's name")
    @ApiResponse(responseCode = "200", description = "Category updated")
    @ApiResponse(responseCode = "400", description = "Validation error",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "404", description = "Category not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @PutMapping("/{id}")
    public NoticeCategoryResponse update(@PathVariable Integer id, @Valid @RequestBody NoticeCategoryRequest request) {
        return NoticeCategoryResponse.from(service.update(id, request.name()));
    }

    @PreAuthorize("hasAuthority('admin')")
    @Operation(summary = "Delete a notice category")
    @ApiResponse(responseCode = "204", description = "Category deleted")
    @ApiResponse(responseCode = "404", description = "Category not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }
}
