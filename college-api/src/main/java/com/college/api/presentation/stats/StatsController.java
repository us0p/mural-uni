package com.college.api.presentation.stats;

import com.college.api.application.stats.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Stats", description = "Public landing-page statistics")
@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService service;

    @Operation(summary = "Get landing-page statistics")
    @ApiResponse(responseCode = "200", description = "OK")
    @SecurityRequirements
    @GetMapping
    public StatsResponse getStats() {
        return service.getStats();
    }
}
