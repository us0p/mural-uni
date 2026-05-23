package com.college.api.presentation.stats;

import com.college.api.application.stats.StatsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StatsController.class)
@AutoConfigureMockMvc(addFilters = false)
class StatsControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean StatsService service;

    @Test
    void GET_stats_returns200WithAllFields() throws Exception {
        when(service.getStats()).thenReturn(new StatsResponse(5, 12, 42, "Latest Notice"));

        mockMvc.perform(get("/api/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.semester_event_count").value(5))
                .andExpect(jsonPath("$.job_post_count").value(12))
                .andExpect(jsonPath("$.connected_students").value(42))
                .andExpect(jsonPath("$.latest_news").value("Latest Notice"));
    }

    @Test
    void GET_stats_whenNoData_returnsZerosAndNullLatestNews() throws Exception {
        when(service.getStats()).thenReturn(new StatsResponse(0, 0, 0, null));

        mockMvc.perform(get("/api/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.semester_event_count").value(0))
                .andExpect(jsonPath("$.job_post_count").value(0))
                .andExpect(jsonPath("$.connected_students").value(0))
                .andExpect(jsonPath("$.latest_news").doesNotExist());
    }
}
