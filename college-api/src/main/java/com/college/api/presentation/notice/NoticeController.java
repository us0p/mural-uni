package com.college.api.presentation.notice;

import com.college.api.application.notice.NoticeService;
import com.college.api.infrastructure.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Notices", description = "User-authored markdown notices")
@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
@Validated
public class NoticeController {

    private final NoticeService service;

    @Operation(summary = "List active notices with optional search and pagination")
    @SecurityRequirements
    @ApiResponse(responseCode = "200", description = "OK")
    @GetMapping
    public NoticePageResponse findAll(
            @RequestParam(name = "search_param", required = false) @Size(max = 200) String searchParam,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") @Max(100) int size
    ) {
        return NoticePageResponse.from(service.findFiltered(searchParam, page, size));
    }

    @Operation(summary = "Get a notice by ID")
    @SecurityRequirements
    @ApiResponse(responseCode = "200", description = "Notice found")
    @ApiResponse(responseCode = "404", description = "Notice not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @GetMapping("/{id}")
    public NoticeResponse findById(@PathVariable Integer id) {
        return NoticeResponse.from(service.findById(id));
    }

    @Operation(summary = "Create a notice")
    @ApiResponse(responseCode = "201", description = "Notice created")
    @ApiResponse(responseCode = "400", description = "Validation error",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "404", description = "Category not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @PreAuthorize("hasAuthority('admin')")
    @PostMapping
    public ResponseEntity<NoticeResponse> create(@Valid @RequestBody NoticeRequest request,
                                                 @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(NoticeResponse.from(service.create(
                        principal.userId(), request.title(), request.markdownContent(),
                        request.categoryId(), request.coverImgUrl())));
    }

    @Operation(summary = "Update a notice's content")
    @ApiResponse(responseCode = "200", description = "Notice updated")
    @ApiResponse(responseCode = "400", description = "Validation error",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "404", description = "Notice or category not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @PreAuthorize("hasAuthority('admin')")
    @PutMapping("/{id}")
    public NoticeResponse update(@PathVariable Integer id, @Valid @RequestBody NoticeUpdateRequest request) {
        return NoticeResponse.from(service.update(
                id, request.title(), request.markdownContent(),
                request.categoryId(), request.coverImgUrl()));
    }

    @Operation(summary = "Soft-delete a notice")
    @ApiResponse(responseCode = "204", description = "Notice deleted")
    @ApiResponse(responseCode = "404", description = "Notice not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @PreAuthorize("hasAuthority('admin')")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        service.softDelete(id);
    }
}
