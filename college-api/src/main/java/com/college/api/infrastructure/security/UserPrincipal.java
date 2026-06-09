package com.college.api.infrastructure.security;

public record UserPrincipal(String username, Integer userId, String roleName) {}
