package com.college.api.presentation.document;

import com.college.api.WithUserPrincipal;
import com.college.api.application.document.DocumentService;
import com.college.api.application.exception.ResourceNotFoundException;
import com.college.api.domain.document.Document;
import com.college.api.domain.role.Role;
import com.college.api.domain.user.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DocumentController.class)
@AutoConfigureMockMvc(addFilters = false)
class DocumentControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean DocumentService service;

    private final User user = User.builder().id(1).username("alice")
            .role(Role.builder().id(1).name("student").build()).build();

    private Document buildDocument() {
        return Document.builder()
                .id(1).user(user).fileName("report.pdf")
                .description("Annual report").fileSize(1024)
                .bucketUrl("https://bucket.s3.us-east-1.amazonaws.com/uuid_report.pdf")
                .knowledgeBase(true)
                .build();
    }

    @Test
    void GET_findAll_returns200WithList() throws Exception {
        when(service.findAll()).thenReturn(List.of(buildDocument()));

        mockMvc.perform(get("/api/documents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fileName").value("report.pdf"))
                .andExpect(jsonPath("$[0].username").value("alice"));
    }

    @Test
    @WithUserPrincipal
    void POST_create_withValidMultipart_returns201() throws Exception {
        when(service.create(anyInt(), any(), any(), any(), any(), anyInt(), anyBoolean()))
                .thenReturn(buildDocument());

        MockMultipartFile file = new MockMultipartFile(
                "file", "report.pdf", "application/pdf", new byte[1024]);

        mockMvc.perform(multipart("/api/documents")
                        .file(file)
                        .param("description", "Annual report")
                        .param("knowledgeBase", "true"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fileName").value("report.pdf"))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.knowledgeBase").value(true));
    }

    @Test
    @WithUserPrincipal
    void POST_create_withoutDescription_returns201() throws Exception {
        when(service.create(anyInt(), any(), isNull(), any(), any(), anyInt(), anyBoolean()))
                .thenReturn(buildDocument());

        MockMultipartFile file = new MockMultipartFile(
                "file", "report.pdf", "application/pdf", new byte[1024]);

        mockMvc.perform(multipart("/api/documents")
                        .file(file))
                .andExpect(status().isCreated());
    }

    @Test
    void POST_create_withMissingFile_returns400() throws Exception {
        mockMvc.perform(multipart("/api/documents"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void GET_download_returnsFileBytes() throws Exception {
        byte[] content = new byte[]{1, 2, 3};
        when(service.download(1)).thenReturn(new DocumentService.DocumentDownload("report.pdf", content));

        mockMvc.perform(get("/api/documents/1/download"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, org.hamcrest.Matchers.containsString("report.pdf")))
                .andExpect(content().contentType(MediaType.APPLICATION_OCTET_STREAM))
                .andExpect(content().bytes(content));
    }

    @Test
    void GET_download_whenNotFound_returns404() throws Exception {
        when(service.download(99)).thenThrow(new ResourceNotFoundException("Document", 99));

        mockMvc.perform(get("/api/documents/99/download"))
                .andExpect(status().isNotFound());
    }

    @Test
    void DELETE_delete_returns204() throws Exception {
        doNothing().when(service).delete(1);

        mockMvc.perform(delete("/api/documents/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void DELETE_delete_whenNotFound_returns404() throws Exception {
        doThrow(new ResourceNotFoundException("Document", 99)).when(service).delete(99);

        mockMvc.perform(delete("/api/documents/99"))
                .andExpect(status().isNotFound());
    }
}
