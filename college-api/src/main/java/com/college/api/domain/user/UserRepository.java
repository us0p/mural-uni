package com.college.api.domain.user;

import java.util.Optional;

public interface UserRepository {
    User save(User user);
    Optional<User> findById(Integer id);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    UserPage findFiltered(String searchParam, int page, int size);
    long countByRoleName(String roleName);
    void incrementTokenVersion(Integer userId);
    void deleteById(Integer id);
    boolean existsById(Integer id);
}
