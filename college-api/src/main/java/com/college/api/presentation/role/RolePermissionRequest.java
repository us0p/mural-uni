package com.college.api.presentation.role;

import jakarta.validation.constraints.NotNull;

public record RolePermissionRequest(
        @NotNull Integer roleId,
        @NotNull Integer permissionId
) {}
