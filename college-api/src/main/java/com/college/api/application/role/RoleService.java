package com.college.api.application.role;

import com.college.api.application.exception.ResourceNotFoundException;
import com.college.api.domain.role.Role;
import com.college.api.domain.role.RolePage;
import com.college.api.domain.role.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository repository;

    @Transactional(readOnly = true)
    public RolePage findFiltered(String searchParam, int page, int size) {
        return repository.findFiltered(searchParam, page, size);
    }

    @Transactional(readOnly = true)
    public Role findById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", id));
    }

    @Transactional
    public Role create(String name) {
        Role role = Role.builder().name(name).build();
        return repository.save(role);
    }

    @Transactional
    public Role update(Integer id, String name) {
        Role role = findById(id);
        role.setName(name);
        return repository.save(role);
    }

    @Transactional
    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Role", id);
        }
        repository.deleteById(id);
    }
}
