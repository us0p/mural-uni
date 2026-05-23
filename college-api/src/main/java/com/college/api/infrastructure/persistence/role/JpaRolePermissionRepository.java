package com.college.api.infrastructure.persistence.role;

import com.college.api.domain.role.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JpaRolePermissionRepository extends JpaRepository<RolePermission, Integer> {
    List<RolePermission> findByRoleId(Integer roleId);
}
