package com.college.api.infrastructure.security;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.DependsOn;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@DependsOn("flyway")
@RequiredArgsConstructor
public class RouteAccessRuleLoader {

    private static final Logger log = LoggerFactory.getLogger(RouteAccessRuleLoader.class);

    private final JdbcTemplate jdbcTemplate;

    public List<RouteAccessRule> loadRules() {
        try {
            return jdbcTemplate.query(
                "SELECT path_pattern, http_method, allowed_roles, priority " +
                "FROM route_access_rules ORDER BY priority DESC",
                (rs, rowNum) -> new RouteAccessRule(
                    rs.getString("path_pattern"),
                    rs.getString("http_method"),
                    rs.getString("allowed_roles"),
                    rs.getInt("priority")
                )
            );
        } catch (Exception e) {
            log.warn("Could not load route_access_rules from DB ({}). Using deny-all fallback.", e.getMessage());
            return List.of(new RouteAccessRule("/**", null, "admin", 100));
        }
    }
}
