package com.college.api.presentation.permissionobject;

import com.college.api.application.permissionobject.PermissionObjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Permission Objects", description = "Named resources that can be granted to roles (e.g. posts, documents)")
@RestController
@RequestMapping("/api/permission-objects")
@RequiredArgsConstructor
public class PermissionObjectController {

    private final PermissionObjectService service;

    @Operation(summary = "List all permission objects")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('admin')")
    @GetMapping
    public List<PermissionObjectResponse> findAll() {
        return service.findAll().stream().map(PermissionObjectResponse::from).toList();
    }
}
