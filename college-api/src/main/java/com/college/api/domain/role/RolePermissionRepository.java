package com.college.api.domain.role;

import java.util.List;
import java.util.Optional;

public interface RolePermissionRepository {
    RolePermission save(RolePermission rolePermission);
    Optional<RolePermission> findById(Integer id);
    List<RolePermission> findAll();
    List<RolePermission> findByRoleId(Integer roleId);
    void deleteById(Integer id);
    boolean existsById(Integer id);
}
