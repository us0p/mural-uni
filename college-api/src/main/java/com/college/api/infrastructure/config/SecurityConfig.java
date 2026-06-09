package com.college.api.infrastructure.config;

import com.college.api.domain.user.UserRepository;
import com.college.api.infrastructure.security.JwtAuthFilter;
import com.college.api.infrastructure.security.JwtService;
import com.college.api.infrastructure.security.RateLimitFilter;
import com.college.api.infrastructure.security.RouteAccessRule;
import com.college.api.infrastructure.security.RouteAccessRuleLoader;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Value("${cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Bean
    public JwtService jwtService() {
        return new JwtService(jwtSecret, jwtExpirationMs);
    }

    @Bean
    public JwtAuthFilter jwtAuthFilter(UserRepository userRepository) {
        return new JwtAuthFilter(jwtService(), userRepository);
    }

    @Bean
    public RateLimitFilter rateLimitFilter() {
        return new RateLimitFilter();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           JwtAuthFilter jwtAuthFilter,
                                           RateLimitFilter rateLimitFilter,
                                           RouteAccessRuleLoader ruleLoader) throws Exception {
        List<RouteAccessRule> rules = ruleLoader.loadRules();

        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(h -> h
                        .contentTypeOptions(Customizer.withDefaults())
                        .frameOptions(fo -> fo.deny())
                        .referrerPolicy(rp -> rp.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(31_536_000))
                )
                .authorizeHttpRequests(auth -> {
                    for (RouteAccessRule rule : rules) {
                        RequestMatcher matcher = rule.httpMethod() != null
                                ? new AntPathRequestMatcher(rule.pathPattern(), rule.httpMethod())
                                : new AntPathRequestMatcher(rule.pathPattern());
                        String[] roles = rule.allowedRoles().split(",");
                        if ("PUBLIC".equals(roles[0])) {
                            auth.requestMatchers(matcher).permitAll();
                        } else if ("AUTHENTICATED".equals(roles[0])) {
                            auth.requestMatchers(matcher).authenticated();
                        } else {
                            auth.requestMatchers(matcher).hasAnyAuthority(roles);
                        }
                    }
                    auth.anyRequest().denyAll();
                })
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
