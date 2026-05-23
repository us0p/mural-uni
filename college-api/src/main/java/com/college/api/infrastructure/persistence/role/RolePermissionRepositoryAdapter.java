package com.college.api.infrastructure.persistence.role;

import com.college.api.domain.role.RolePermission;
import com.college.api.domain.role.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class RolePermissionRepositoryAdapter implements RolePermissionRepository {

    private final JpaRolePermissionRepository jpa;

    @Override
    public RolePermission save(RolePermission rolePermission) {
        return jpa.save(rolePermission);
    }

    @Override
    public Optional<RolePermission> findById(Integer id) {
        return jpa.findById(id);
    }

    @Override
    public List<RolePermission> findAll() {
        return jpa.findAll();
    }

    @Override
    public List<RolePermission> findByRoleId(Integer roleId) {
        return jpa.findByRoleId(roleId);
    }

    @Override
    public void deleteById(Integer id) {
        jpa.deleteById(id);
    }

    @Override
    public boolean existsById(Integer id) {
        return jpa.existsById(id);
    }
}
