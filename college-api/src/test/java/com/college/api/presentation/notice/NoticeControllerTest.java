package com.college.api.presentation.notice;

import com.college.api.application.exception.ResourceNotFoundException;
import com.college.api.application.notice.NoticeService;
import com.college.api.WithUserPrincipal;
import com.college.api.domain.notice.Notice;
import com.college.api.domain.notice.NoticeCategory;
import com.college.api.domain.notice.NoticePage;
import com.college.api.domain.role.Role;
import com.college.api.domain.user.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NoticeController.class)
@AutoConfigureMockMvc(addFilters = false)
class NoticeControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean NoticeService service;

    private final User user = User.builder().id(1).username("alice")
            .role(Role.builder().id(1).name("student").build()).build();
    private final NoticeCategory category = NoticeCategory.builder().id(1).name("general").build();

    private Notice buildNotice() {
        return Notice.builder().id(1).user(user).title("Hello").markdownContent("# Hello")
                .category(category).createdAt(OffsetDateTime.now()).updatedAt(OffsetDateTime.now()).build();
    }

    private NoticePage buildPage(List<Notice> notices) {
        return new NoticePage(notices, 0, 10, notices.size(), notices.isEmpty() ? 0 : 1);
    }

    // ── GET /api/notices ────────────────────────────────────────────────────────

    @Test
    void GET_findAll_withNoParams_returns200WithPagedResponse() throws Exception {
        when(service.findFiltered(null, 0, 10)).thenReturn(buildPage(List.of(buildNotice())));

        mockMvc.perform(get("/api/notices"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Hello"))
                .andExpect(jsonPath("$.content[0].categoryName").value("general"))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10));
    }

    @Test
    void GET_findAll_withSearchParam_passesToService() throws Exception {
        when(service.findFiltered("hello", 0, 10)).thenReturn(buildPage(List.of(buildNotice())));

        mockMvc.perform(get("/api/notices").param("search_param", "hello"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Hello"));

        verify(service).findFiltered("hello", 0, 10);
    }

    @Test
    void GET_findAll_withPaginationParams_passesToService() throws Exception {
        when(service.findFiltered(null, 2, 5)).thenReturn(new NoticePage(List.of(), 2, 5, 0, 0));

        mockMvc.perform(get("/api/notices").param("page", "2").param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(2))
                .andExpect(jsonPath("$.size").value(5));

        verify(service).findFiltered(null, 2, 5);
    }

    @Test
    void GET_findAll_withNoResults_returnsEmptyPage() throws Exception {
        when(service.findFiltered(null, 0, 10)).thenReturn(new NoticePage(List.of(), 0, 10, 0, 0));

        mockMvc.perform(get("/api/notices"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    // ── GET /api/notices/{id} ───────────────────────────────────────────────────

    @Test
    void GET_findById_whenExists_returns200() throws Exception {
        when(service.findById(1)).thenReturn(buildNotice());

        mockMvc.perform(get("/api/notices/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Hello"));
    }

    @Test
    void GET_findById_whenNotFound_returns404() throws Exception {
        when(service.findById(99)).thenThrow(new ResourceNotFoundException("Notice", 99));

        mockMvc.perform(get("/api/notices/99"))
                .andExpect(status().isNotFound());
    }

    // ── POST /api/notices ───────────────────────────────────────────────────────

    @Test
    @WithUserPrincipal
    void POST_create_withValidBody_returns201() throws Exception {
        when(service.create(eq(1), eq("Hello"), any(), eq(1), isNull())).thenReturn(buildNotice());

        mockMvc.perform(post("/api/notices")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new NoticeRequest("Hello", "# Hello", 1, null))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Hello"))
                .andExpect(jsonPath("$.categoryId").value(1));
    }

    @Test
    @WithUserPrincipal
    void POST_create_withMissingCategoryId_returns400() throws Exception {
        mockMvc.perform(post("/api/notices")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Hello\",\"markdownContent\":\"# Hello\"}"))
                .andExpect(status().isBadRequest());
    }

    // ── PUT /api/notices/{id} ───────────────────────────────────────────────────

    @Test
    void PUT_update_returns200() throws Exception {
        when(service.update(eq(1), any(), any(), eq(1), isNull())).thenReturn(buildNotice());

        mockMvc.perform(put("/api/notices/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new NoticeUpdateRequest("Updated", "# Updated", 1, null))))
                .andExpect(status().isOk());
    }

    // ── DELETE /api/notices/{id} ────────────────────────────────────────────────

    @Test
    void DELETE_softDelete_returns204() throws Exception {
        doNothing().when(service).softDelete(1);

        mockMvc.perform(delete("/api/notices/1"))
                .andExpect(status().isNoContent());
    }
}
