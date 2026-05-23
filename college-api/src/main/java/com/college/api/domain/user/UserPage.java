package com.college.api.domain.user;

import java.util.List;

public record UserPage(
        List<User> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {}
