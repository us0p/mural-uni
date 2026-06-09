package com.college.api.presentation.auth;

public record LoginResponse(
        Integer userId,
        String username,
        String email,
        String phoneNumber,
        String ra,
        Integer roleId,
        String roleName
) {}
