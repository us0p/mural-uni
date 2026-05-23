package com.college.api.application.permissionobject;

import com.college.api.domain.permissionobject.PermissionObject;
import com.college.api.domain.permissionobject.PermissionObjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PermissionObjectService {

    private final PermissionObjectRepository repository;

    @Transactional(readOnly = true)
    public List<PermissionObject> findAll() {
        return repository.findAll();
    }
}
