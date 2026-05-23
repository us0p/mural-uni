package com.college.api.infrastructure.persistence.permissionobject;

import com.college.api.domain.permissionobject.PermissionObject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaPermissionObjectRepository extends JpaRepository<PermissionObject, Integer> {
}
