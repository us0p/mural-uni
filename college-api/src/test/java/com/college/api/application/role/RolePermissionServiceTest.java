package com.college.api.application.role;

import com.college.api.application.exception.ResourceNotFoundException;
import com.college.api.domain.permissionobject.PermissionObject;
import com.college.api.domain.permissionobject.PermissionObjectRepository;
import com.college.api.domain.role.Role;
import com.college.api.domain.role.RolePermission;
import com.college.api.domain.role.RolePermissionRepository;
import com.college.api.domain.role.RoleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RolePermissionServiceTest {

    @Mock private RolePermissionRepository repository;
    @Mock private RoleRepository roleRepository;
    @Mock private PermissionObjectRepository permissionObjectRepository;

    @InjectMocks
    private RolePermissionService service;

    private final Role role = Role.builder().id(1).name("admin").build();
    private final PermissionObject permission = PermissionObject.builder().id(2).name("posts").build();

    @Test
    void create_whenBothExist_savesRolePermission() {
        when(roleRepository.findById(1)).thenReturn(Optional.of(role));
        when(permissionObjectRepository.findById(2)).thenReturn(Optional.of(permission));
        RolePermission saved = RolePermission.builder().id(1).role(role).permission(permission).build();
        when(repository.save(any())).thenReturn(saved);

        RolePermission result = service.create(1, 2);

        assertThat(result.getRole()).isEqualTo(role);
        assertThat(result.getPermission()).isEqualTo(permission);
    }

    @Test
    void create_whenRoleNotFound_throwsResourceNotFoundException() {
        when(roleRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(99, 2))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void create_whenPermissionNotFound_throwsResourceNotFoundException() {
        when(roleRepository.findById(1)).thenReturn(Optional.of(role));
        when(permissionObjectRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(1, 99))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void findByRoleId_returnsMappings() {
        List<RolePermission> mappings = List.of(
                RolePermission.builder().id(1).role(role).permission(permission).build()
        );
        when(repository.findByRoleId(1)).thenReturn(mappings);

        assertThat(service.findByRoleId(1)).hasSize(1);
    }

    @Test
    void delete_whenExists_deletesById() {
        when(repository.existsById(1)).thenReturn(true);

        service.delete(1);

        verify(repository).deleteById(1);
    }
}
