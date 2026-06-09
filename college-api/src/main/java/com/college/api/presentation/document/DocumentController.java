package com.college.api.presentation.document;

import com.college.api.application.document.DocumentService;
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

    @Operation(summary = "List all documents (super users only)")
    @PreAuthorize("hasAnyAuthority('admin', 'professor')")
    @GetMapping
    public List<DocumentResponse> findAll() {
        return service.findAll().stream().map(DocumentResponse::from).toList();
    }

    @Operation(summary = "List documents visible to the authenticated user",
            description = "Super users see all documents; alunos see only documents assigned to them.")
    @GetMapping("/mine")
    public List<DocumentResponse> findMine(@AuthenticationPrincipal UserPrincipal principal) {
        return service.findForCurrentUser(principal.userId(), principal.roleName())
                .stream().map(DocumentResponse::from).toList();
    }

    @Operation(summary = "List public documents (no authentication required)")
    @GetMapping("/public")
    public List<DocumentResponse> findAllPublic() {
        return service.findAllPublic().stream().map(DocumentResponse::from).toList();
    }

    @Operation(summary = "Download a public document (no authentication required)")
    @GetMapping("/public/{id}/download")
    public ResponseEntity<byte[]> downloadPublic(@PathVariable Integer id) {
        DocumentService.DocumentDownload download = service.downloadPublic(id);
        String safeFilename = download.fileName().replaceAll("[\"\\\\/:*?<>|\\r\\n]", "_");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        org.springframework.http.ContentDisposition.attachment()
                                .filename(safeFilename, java.nio.charset.StandardCharsets.UTF_8)
                                .build().toString())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(download.content());
    }

    @Operation(summary = "Upload a document",
            description = "Uploads the file to local storage and persists metadata. If recipientId is provided, the document is assigned to that aluno and the knowledge base flag is forced to false.")
    @ApiResponse(responseCode = "201", description = "Document uploaded")
    @ApiResponse(responseCode = "400", description = "Missing required parameter or file",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "404", description = "User not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @PreAuthorize("hasAnyAuthority('admin', 'professor')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentResponse> create(
            @RequestParam(required = false) String description,
            @RequestParam(required = false, defaultValue = "false") boolean knowledgeBase,
            @RequestParam(required = false, defaultValue = "false") boolean isPublic,
            @RequestParam(required = false) Integer recipientId,
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
        DocumentService.DocumentWithRecipient result = service.create(
                principal.userId(), safeFileName, description, bytes,
                detectedType, bytes.length, knowledgeBase, isPublic, recipientId);
        return ResponseEntity.status(HttpStatus.CREATED).body(DocumentResponse.from(result));
    }

    @Operation(summary = "Download a document")
    @ApiResponse(responseCode = "200", description = "File contents",
            headers = @Header(name = HttpHeaders.CONTENT_DISPOSITION,
                    description = "attachment; filename=\"<filename>\"",
                    schema = @Schema(type = "string")),
            content = @Content(mediaType = MediaType.APPLICATION_OCTET_STREAM_VALUE,
                    schema = @Schema(type = "string", format = "binary")))
    @ApiResponse(responseCode = "404", description = "Document not found",
            content = @Content(mediaType = "application/problem+json",
                    schema = @Schema(implementation = ProblemDetail.class)))
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Integer id,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        DocumentService.DocumentDownload download = service.download(id, principal.userId(), principal.roleName());
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
    @PreAuthorize("hasAnyAuthority('admin', 'professor')")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }
}
