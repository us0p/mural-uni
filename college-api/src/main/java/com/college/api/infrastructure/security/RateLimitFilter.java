package com.college.api.infrastructure.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class RateLimitFilter extends OncePerRequestFilter {

    private record Policy(long tokens, Duration refillDuration) {}

    private static final Map<String, Policy> PATH_POLICIES = Map.of(
            "/api/auth/login",           new Policy(5,  Duration.ofMinutes(1)),
            "/api/auth/set-password",    new Policy(10, Duration.ofMinutes(1)),
            "/api/auth/forgot-password", new Policy(3,  Duration.ofHours(1))
    );

    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String path = request.getRequestURI();
        Policy policy = PATH_POLICIES.get(path);

        if (policy == null) {
            chain.doFilter(request, response);
            return;
        }

        String ip = resolveIp(request);
        String bucketKey = path + ":" + ip;
        Bucket bucket = buckets.computeIfAbsent(bucketKey, k -> buildBucket(policy));

        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", "60");
            response.getWriter().write("{\"status\":429,\"detail\":\"Too many requests. Please try again later.\"}");
        }
    }

    private static Bucket buildBucket(Policy policy) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(policy.tokens())
                .refillGreedy(policy.tokens(), policy.refillDuration())
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private static String resolveIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
