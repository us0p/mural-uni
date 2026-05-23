package com.college.api.presentation.role;

import com.college.api.domain.role.Role;

public record RoleResponse(Integer id, String name) {

    public static RoleResponse from(Role role) {
        return new RoleResponse(role.getId(), role.getName());
    }
}
