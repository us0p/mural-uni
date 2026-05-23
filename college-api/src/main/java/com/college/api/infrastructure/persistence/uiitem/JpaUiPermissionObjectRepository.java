package com.college.api.infrastructure.persistence.uiitem;

import com.college.api.domain.uiitem.UiPermissionObject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JpaUiPermissionObjectRepository extends JpaRepository<UiPermissionObject, Integer> {
    List<UiPermissionObject> findByUiItemName(String uiItemName);
}
