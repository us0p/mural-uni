package com.college.api.presentation.auth;

import java.util.List;

public record LoginResponse(
        Integer userId,
        String username,
        String email,
        String phoneNumber,
        String ra,
        Integer roleId,
        String roleName,
        List<String> permissions
) {}
