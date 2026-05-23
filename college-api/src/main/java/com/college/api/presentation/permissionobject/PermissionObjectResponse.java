package com.college.api.presentation.permissionobject;

import com.college.api.domain.permissionobject.PermissionObject;

public record PermissionObjectResponse(Integer id, String name) {

    public static PermissionObjectResponse from(PermissionObject p) {
        return new PermissionObjectResponse(p.getId(), p.getName());
    }
}
