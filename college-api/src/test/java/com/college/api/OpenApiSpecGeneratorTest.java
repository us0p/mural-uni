package com.college.api;

import com.college.api.infrastructure.security.RouteAccessRule;
import com.college.api.infrastructure.security.RouteAccessRuleLoader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.flyway.enabled=false"
})
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class OpenApiSpecGeneratorTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    RouteAccessRuleLoader ruleLoader;

    @BeforeEach
    void setupRules() {
        when(ruleLoader.loadRules()).thenReturn(List.of(
                new RouteAccessRule("/**", null, "admin", 100)
        ));
    }

    @Test
    void writeOpenApiSpecToFile() throws Exception {
        MvcResult result = mockMvc.perform(get("/api-docs"))
                .andExpect(status().isOk())
                .andReturn();

        Files.writeString(
                Path.of("openapi.json"),
                result.getResponse().getContentAsString()
        );
    }
}
