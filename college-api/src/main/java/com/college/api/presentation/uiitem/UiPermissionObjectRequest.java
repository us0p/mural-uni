package com.college.api.presentation.uiitem;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UiPermissionObjectRequest(
        @NotBlank @Size(max = 20) String uiItemName,
        @NotNull Integer permissionId
) {}
