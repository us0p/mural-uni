package com.college.api.infrastructure.persistence.user;

import com.college.api.domain.user.User;
import com.college.api.domain.user.UserPage;
import com.college.api.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.query.criteria.HibernateCriteriaBuilder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UserRepositoryAdapter implements UserRepository {

    private final JpaUserRepository jpa;

    @Override
    public User save(User user) {
        return jpa.save(user);
    }

    @Override
    public Optional<User> findById(Integer id) {
        return jpa.findById(id);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return jpa.findByUsername(username);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return jpa.findByEmail(email);
    }

    @Override
    public UserPage findFiltered(String searchParam, int page, int size) {
        Page<User> result = jpa.findAll(matchesSearch(searchParam), PageRequest.of(page, size));
        return new UserPage(result.getContent(), result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }

    @Override
    public long countByRoleName(String roleName) {
        return jpa.countByRoleName(roleName);
    }

    @Override
    public void incrementTokenVersion(Integer userId) {
        jpa.incrementTokenVersion(userId);
    }

    @Override
    public void deleteById(Integer id) {
        jpa.deleteById(id);
    }

    @Override
    public boolean existsById(Integer id) {
        return jpa.existsById(id);
    }

    private static Specification<User> matchesSearch(String searchParam) {
        if (searchParam == null || searchParam.isBlank()) return null;
        String pattern = "%" + searchParam + "%";
        return (root, query, cb) -> {
            HibernateCriteriaBuilder hcb = (HibernateCriteriaBuilder) cb;
            var emailPred = hcb.ilike(root.<String>get("email"), pattern);
            var phonePred = hcb.ilike(root.<String>get("phoneNumber"), pattern);
            var rolePred = hcb.ilike(root.get("role").<String>get("name"), pattern);
            return cb.or(emailPred, phonePred, rolePred);
        };
    }
}
