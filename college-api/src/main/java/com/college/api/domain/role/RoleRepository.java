package com.college.api.domain.role;

import java.util.List;
import java.util.Optional;

public interface RoleRepository {
    Role save(Role role);
    Optional<Role> findById(Integer id);
    Optional<Role> findByName(String name);
    RolePage findFiltered(String searchParam, int page, int size);
    void deleteById(Integer id);
    boolean existsById(Integer id);
}
