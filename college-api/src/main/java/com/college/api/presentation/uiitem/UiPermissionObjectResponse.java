package com.college.api.presentation.uiitem;

import com.college.api.domain.uiitem.UiPermissionObject;

public record UiPermissionObjectResponse(
        Integer id,
        String uiItemName,
        Integer permissionId,
        String permissionName
) {
    public static UiPermissionObjectResponse from(UiPermissionObject upo) {
        return new UiPermissionObjectResponse(
                upo.getId(),
                upo.getUiItem().getName(),
                upo.getPermission().getId(),
                upo.getPermission().getName()
        );
    }
}
