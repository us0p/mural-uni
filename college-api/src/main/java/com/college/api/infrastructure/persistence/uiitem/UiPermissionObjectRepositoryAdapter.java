package com.college.api.infrastructure.persistence.uiitem;

import com.college.api.domain.uiitem.UiPermissionObject;
import com.college.api.domain.uiitem.UiPermissionObjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UiPermissionObjectRepositoryAdapter implements UiPermissionObjectRepository {

    private final JpaUiPermissionObjectRepository jpa;

    @Override
    public UiPermissionObject save(UiPermissionObject uiPermissionObject) {
        return jpa.save(uiPermissionObject);
    }

    @Override
    public Optional<UiPermissionObject> findById(Integer id) {
        return jpa.findById(id);
    }

    @Override
    public List<UiPermissionObject> findAll() {
        return jpa.findAll();
    }

    @Override
    public List<UiPermissionObject> findByUiItemName(String uiItemName) {
        return jpa.findByUiItemName(uiItemName);
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
