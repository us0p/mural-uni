package com.college.api.domain.uiitem;

import java.util.List;
import java.util.Optional;

public interface UiPermissionObjectRepository {
    UiPermissionObject save(UiPermissionObject uiPermissionObject);
    Optional<UiPermissionObject> findById(Integer id);
    List<UiPermissionObject> findAll();
    List<UiPermissionObject> findByUiItemName(String uiItemName);
    void deleteById(Integer id);
    boolean existsById(Integer id);
}
