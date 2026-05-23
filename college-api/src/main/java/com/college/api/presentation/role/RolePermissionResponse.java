package com.college.api.presentation.role;

import com.college.api.domain.role.RolePermission;

public record RolePermissionResponse(
        Integer id,
        Integer roleId,
        String roleName,
        Integer permissionId,
        String permissionName
) {
    public static RolePermissionResponse from(RolePermission rp) {
        return new RolePermissionResponse(
                rp.getId(),
                rp.getRole().getId(),
                rp.getRole().getName(),
                rp.getPermission().getId(),
                rp.getPermission().getName()
        );
    }
}
