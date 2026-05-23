package com.college.api.application.uiitem;

import com.college.api.application.exception.ResourceNotFoundException;
import com.college.api.domain.permissionobject.PermissionObject;
import com.college.api.domain.permissionobject.PermissionObjectRepository;
import com.college.api.domain.uiitem.UiItem;
import com.college.api.domain.uiitem.UiItemRepository;
import com.college.api.domain.uiitem.UiPermissionObject;
import com.college.api.domain.uiitem.UiPermissionObjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UiPermissionObjectService {

    private final UiPermissionObjectRepository repository;
    private final UiItemRepository uiItemRepository;
    private final PermissionObjectRepository permissionObjectRepository;

    @Transactional(readOnly = true)
    public List<UiPermissionObject> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public UiPermissionObject findById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UiPermissionObject", id));
    }

    @Transactional(readOnly = true)
    public List<UiPermissionObject> findByUiItemName(String uiItemName) {
        return repository.findByUiItemName(uiItemName);
    }

    @Transactional
    public UiPermissionObject create(String uiItemName, Integer permissionId) {
        UiItem uiItem = uiItemRepository.findById(uiItemName)
                .orElseThrow(() -> new ResourceNotFoundException("UiItem", uiItemName));
        PermissionObject permission = permissionObjectRepository.findById(permissionId)
                .orElseThrow(() -> new ResourceNotFoundException("PermissionObject", permissionId));
        return repository.save(UiPermissionObject.builder()
                .uiItem(uiItem)
                .permission(permission)
                .build());
    }

    @Transactional
    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("UiPermissionObject", id);
        }
        repository.deleteById(id);
    }
}
