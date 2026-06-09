package com.college.api.infrastructure.security;

public record RouteAccessRule(String pathPattern, String httpMethod, String allowedRoles, int priority) {}
