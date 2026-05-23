package com.college.api.domain.permissionobject;

import java.util.List;
import java.util.Optional;

public interface PermissionObjectRepository {
    PermissionObject save(PermissionObject permissionObject);
    Optional<PermissionObject> findById(Integer id);
    List<PermissionObject> findAll();
    void deleteById(Integer id);
    boolean existsById(Integer id);
}
