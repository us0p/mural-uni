package com.college.api.domain.role;

import java.util.List;

public record RolePage(
        List<Role> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {}
