package com.college.api.infrastructure.persistence.permissionobject;

import com.college.api.domain.permissionobject.PermissionObject;
import com.college.api.domain.permissionobject.PermissionObjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class PermissionObjectRepositoryAdapter implements PermissionObjectRepository {

    private final JpaPermissionObjectRepository jpa;

    @Override
    public PermissionObject save(PermissionObject permissionObject) {
        return jpa.save(permissionObject);
    }

    @Override
    public Optional<PermissionObject> findById(Integer id) {
        return jpa.findById(id);
    }

    @Override
    public List<PermissionObject> findAll() {
        return jpa.findAll();
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
