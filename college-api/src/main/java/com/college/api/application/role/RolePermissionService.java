package com.college.api.application.role;

import com.college.api.application.exception.ResourceNotFoundException;
import com.college.api.domain.permissionobject.PermissionObject;
import com.college.api.domain.permissionobject.PermissionObjectRepository;
import com.college.api.domain.role.Role;
import com.college.api.domain.role.RolePermission;
import com.college.api.domain.role.RolePermissionRepository;
import com.college.api.domain.role.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RolePermissionService {

    private final RolePermissionRepository repository;
    private final RoleRepository roleRepository;
    private final PermissionObjectRepository permissionObjectRepository;

    @Transactional(readOnly = true)
    public List<RolePermission> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public RolePermission findById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RolePermission", id));
    }

    @Transactional(readOnly = true)
    public List<RolePermission> findByRoleId(Integer roleId) {
        return repository.findByRoleId(roleId);
    }

    @Transactional
    public RolePermission create(Integer roleId, Integer permissionId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", roleId));
        PermissionObject permission = permissionObjectRepository.findById(permissionId)
                .orElseThrow(() -> new ResourceNotFoundException("PermissionObject", permissionId));

        RolePermission rolePermission = RolePermission.builder()
                .role(role)
                .permission(permission)
                .build();
        return repository.save(rolePermission);
    }

    @Transactional
    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("RolePermission", id);
        }
        repository.deleteById(id);
    }
}
