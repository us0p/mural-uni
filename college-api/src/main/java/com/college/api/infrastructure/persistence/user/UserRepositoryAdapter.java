package com.college.api.infrastructure.persistence.user;

import com.college.api.domain.user.User;
import com.college.api.domain.user.UserPage;
import com.college.api.domain.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.hibernate.query.criteria.HibernateCriteriaBuilder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
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
    public UserPage findStudents(String searchParam, int page, int size) {
        Specification<User> spec = isAluno().and(matchesStudentSearch(searchParam));
        Page<User> result = jpa.findAll(spec, PageRequest.of(page, size));
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

    @Override
    @Transactional
    public void updateFirstLoginAt(Integer userId, OffsetDateTime firstLoginAt) {
        jpa.updateFirstLoginAt(userId, firstLoginAt);
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

    private static Specification<User> isAluno() {
        return (root, query, cb) -> cb.equal(root.get("role").get("name"), "aluno");
    }

    private static Specification<User> matchesStudentSearch(String searchParam) {
        if (searchParam == null || searchParam.isBlank()) return null;
        String pattern = "%" + searchParam + "%";
        return (root, query, cb) -> {
            HibernateCriteriaBuilder hcb = (HibernateCriteriaBuilder) cb;
            var usernamePred = hcb.ilike(root.<String>get("username"), pattern);
            var emailPred = hcb.ilike(root.<String>get("email"), pattern);
            var raPred = hcb.ilike(root.<String>get("ra"), pattern);
            return cb.or(usernamePred, emailPred, raPred);
        };
    }
}
