package com.college.api.infrastructure.persistence.role;

import com.college.api.domain.role.Role;
import com.college.api.domain.role.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class RoleRepositoryAdapter implements RoleRepository {

    private final JpaRoleRepository jpa;

    @Override
    public Role save(Role role) { return jpa.save(role); }

    @Override
    public Optional<Role> findById(Integer id) { return jpa.findById(id); }

    @Override
    public Optional<Role> findByName(String name) { return jpa.findByName(name); }

    @Override
    public List<Role> findAll() { return jpa.findAll(); }

    @Override
    public void deleteById(Integer id) { jpa.deleteById(id); }

    @Override
    public boolean existsById(Integer id) { return jpa.existsById(id); }
}
