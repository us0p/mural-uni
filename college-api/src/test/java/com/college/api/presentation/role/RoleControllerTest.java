package com.college.api.presentation.role;

import com.college.api.application.exception.ResourceNotFoundException;
import com.college.api.application.role.RoleService;
import com.college.api.domain.role.Role;
import com.college.api.domain.role.RolePage;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RoleController.class)
@AutoConfigureMockMvc(addFilters = false)
class RoleControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean RoleService service;

    private Role buildRole() {
        return Role.builder().id(1).name("admin").build();
    }

    private RolePage buildPage(List<Role> roles) {
        return new RolePage(roles, 0, 10, roles.size(), roles.isEmpty() ? 0 : 1);
    }

    // ── GET /api/roles ────────────────────────────────────────────────────────

    @Test
    void GET_findAll_withNoParams_returns200WithPagedResponse() throws Exception {
        when(service.findFiltered(null, 0, 10)).thenReturn(buildPage(List.of(buildRole())));

        mockMvc.perform(get("/api/roles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("admin"))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10));
    }

    @Test
    void GET_findAll_withSearchParam_passesToService() throws Exception {
        when(service.findFiltered("admin", 0, 10)).thenReturn(buildPage(List.of(buildRole())));

        mockMvc.perform(get("/api/roles").param("search_param", "admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("admin"));

        verify(service).findFiltered("admin", 0, 10);
    }

    @Test
    void GET_findAll_withPaginationParams_passesToService() throws Exception {
        when(service.findFiltered(null, 1, 5)).thenReturn(new RolePage(List.of(), 1, 5, 0, 0));

        mockMvc.perform(get("/api/roles").param("page", "1").param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.size").value(5));

        verify(service).findFiltered(null, 1, 5);
    }

    @Test
    void GET_findAll_withNoResults_returnsEmptyPage() throws Exception {
        when(service.findFiltered(null, 0, 10)).thenReturn(new RolePage(List.of(), 0, 10, 0, 0));

        mockMvc.perform(get("/api/roles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    // ── GET /api/roles/{id} ───────────────────────────────────────────────────

    @Test
    void GET_findById_whenNotFound_returns404() throws Exception {
        when(service.findById(99)).thenThrow(new ResourceNotFoundException("Role", 99));

        mockMvc.perform(get("/api/roles/99"))
                .andExpect(status().isNotFound());
    }

    // ── POST /api/roles ───────────────────────────────────────────────────────

    @Test
    void POST_create_withValidBody_returns201() throws Exception {
        when(service.create("admin")).thenReturn(Role.builder().id(1).name("admin").build());

        mockMvc.perform(post("/api/roles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RoleRequest("admin"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("admin"));
    }

    @Test
    void POST_create_withBlankName_returns400() throws Exception {
        mockMvc.perform(post("/api/roles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RoleRequest(""))))
                .andExpect(status().isBadRequest());
    }

    // ── PUT /api/roles/{id} ───────────────────────────────────────────────────

    @Test
    void PUT_update_whenExists_returns200() throws Exception {
        when(service.update(eq(1), any())).thenReturn(Role.builder().id(1).name("student").build());

        mockMvc.perform(put("/api/roles/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RoleRequest("student"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("student"));
    }

    // ── DELETE /api/roles/{id} ────────────────────────────────────────────────

    @Test
    void DELETE_delete_whenExists_returns204() throws Exception {
        doNothing().when(service).delete(1);

        mockMvc.perform(delete("/api/roles/1"))
                .andExpect(status().isNoContent());
    }
}
