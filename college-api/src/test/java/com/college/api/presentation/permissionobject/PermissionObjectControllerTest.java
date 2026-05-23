package com.college.api.presentation.permissionobject;

import com.college.api.application.permissionobject.PermissionObjectService;
import com.college.api.domain.permissionobject.PermissionObject;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PermissionObjectController.class)
@AutoConfigureMockMvc(addFilters = false)
class PermissionObjectControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean PermissionObjectService service;

    @Test
    void GET_findAll_returns200WithList() throws Exception {
        when(service.findAll()).thenReturn(List.of(
                PermissionObject.builder().id(1).name("posts").build()
        ));

        mockMvc.perform(get("/api/permission-objects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("posts"));
    }
}
