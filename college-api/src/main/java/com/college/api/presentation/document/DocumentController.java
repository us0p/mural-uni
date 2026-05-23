package com.college.api.presentation.document;

import com.college.api.application.document.DocumentService;
import com.college.api.domain.document.Document;
import com.college.api.infrastructure.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.headers.Header;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@Tag(name = "Documents", description = "Document upload, storage and AI embedding management")
@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/msword",
            "application/vnd.ms-excel",
            "text/plain",
            "image/png",
            "image/jpeg"
    );

    private final DocumentService service;

    @Operation(summary = "List all documents")
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping
    public List<DocumentResponse> findAll() {
        return service.findAll().stream().map(DocumentResponse::from).toList();
    }

    @Operation(summary = "Upload a document",
            description = "Uploads the file to S3, persists metadata, and automatically generates and stores vector embeddings via the configured embedding model.")
    @ApiResponse(responseCode = "201", description = "Document uploaded and embeddings stored")
    @ApiResponse(responseCode = "400", description = "Missing required parameter or file",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "404", description = "User not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @PreAuthorize("hasAuthority('admin')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentResponse> create(
            @RequestParam(required = false) String description,
            @RequestParam(required = false, defaultValue = "false") boolean knowledgeBase,
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }
        String rawName = file.getOriginalFilename() != null ? file.getOriginalFilename() : file.getName();
        String safeFileName = rawName.replaceAll("[\"\\\\/:*?<>|\\r\\n]", "_");
        byte[] bytes = file.getBytes();
        org.apache.tika.Tika tika = new org.apache.tika.Tika();
        String detectedType = tika.detect(bytes, safeFileName);
        if (!ALLOWED_CONTENT_TYPES.contains(detectedType)) {
            throw new IllegalArgumentException("File type not allowed: " + detectedType);
        }
        Document document = service.create(
                principal.userId(), safeFileName, description, bytes,
                detectedType, bytes.length, knowledgeBase);
        return ResponseEntity.status(HttpStatus.CREATED).body(DocumentResponse.from(document));
    }

    @Operation(summary = "Download a document from S3")
    @ApiResponse(responseCode = "200", description = "File contents",
            headers = @Header(name = HttpHeaders.CONTENT_DISPOSITION,
                    description = "attachment; filename=\"<filename>\"",
                    schema = @Schema(type = "string")),
            content = @Content(mediaType = MediaType.APPLICATION_OCTET_STREAM_VALUE,
                    schema = @Schema(type = "string", format = "binary")))
    @ApiResponse(responseCode = "404", description = "Document not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Integer id) {
        DocumentService.DocumentDownload download = service.download(id);
        String safeFilename = download.fileName().replaceAll("[\"\\\\/:*?<>|\\r\\n]", "_");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        org.springframework.http.ContentDisposition.attachment()
                                .filename(safeFilename, java.nio.charset.StandardCharsets.UTF_8)
                                .build().toString())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(download.content());
    }

    @Operation(summary = "Delete a document")
    @ApiResponse(responseCode = "204", description = "Document deleted")
    @ApiResponse(responseCode = "404", description = "Document not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @PreAuthorize("hasAuthority('admin')")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }
}
