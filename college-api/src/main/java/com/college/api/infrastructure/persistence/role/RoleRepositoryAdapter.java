package com.college.api.infrastructure.persistence.role;

import com.college.api.domain.role.Role;
import com.college.api.domain.role.RolePage;
import com.college.api.domain.role.RolePermission;
import com.college.api.domain.role.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.query.criteria.HibernateCriteriaBuilder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

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
    public RolePage findFiltered(String searchParam, int page, int size) {
        Page<Role> result = jpa.findAll(matchesSearch(searchParam), PageRequest.of(page, size));
        return new RolePage(result.getContent(), result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }

    @Override
    public void deleteById(Integer id) { jpa.deleteById(id); }

    @Override
    public boolean existsById(Integer id) { return jpa.existsById(id); }

    private static Specification<Role> matchesSearch(String searchParam) {
        if (searchParam == null || searchParam.isBlank()) return null;
        String pattern = "%" + searchParam + "%";
        return (root, query, cb) -> {
            HibernateCriteriaBuilder hcb = (HibernateCriteriaBuilder) cb;

            // role name matches
            var namePred = hcb.ilike(root.<String>get("name"), pattern);

            // EXISTS (SELECT rp FROM RolePermission rp WHERE rp.role = r AND rp.permission.name ILIKE ...)
            var sub = query.subquery(Integer.class);
            var rp = sub.from(RolePermission.class);
            sub.select(rp.get("id"))
               .where(cb.and(
                   cb.equal(rp.get("role"), root),
                   hcb.ilike(rp.get("permission").<String>get("name"), pattern)
               ));

            return cb.or(namePred, cb.exists(sub));
        };
    }
}
