package com.college.api.application.permissionobject;

import com.college.api.domain.permissionobject.PermissionObject;
import com.college.api.domain.permissionobject.PermissionObjectRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PermissionObjectServiceTest {

    @Mock
    private PermissionObjectRepository repository;

    @InjectMocks
    private PermissionObjectService service;

    @Test
    void findAll_returnsAllPermissionObjects() {
        List<PermissionObject> expected = List.of(
                PermissionObject.builder().id(1).name("posts").build(),
                PermissionObject.builder().id(2).name("documents").build()
        );
        when(repository.findAll()).thenReturn(expected);

        List<PermissionObject> result = service.findAll();

        assertThat(result).hasSize(2).isEqualTo(expected);
    }
}
