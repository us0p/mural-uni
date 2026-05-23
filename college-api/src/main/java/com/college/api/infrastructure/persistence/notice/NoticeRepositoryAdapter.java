package com.college.api.infrastructure.persistence.notice;

import com.college.api.domain.notice.Notice;
import com.college.api.domain.notice.NoticePage;
import com.college.api.domain.notice.NoticeRepository;
import jakarta.persistence.criteria.JoinType;
import lombok.RequiredArgsConstructor;
import org.hibernate.query.criteria.HibernateCriteriaBuilder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class NoticeRepositoryAdapter implements NoticeRepository {

    private final JpaNoticeRepository jpa;

    @Override
    public Notice save(Notice notice) {
        return jpa.save(notice);
    }

    @Override
    public Optional<Notice> findById(Integer id) {
        return jpa.findById(id);
    }

    @Override
    public NoticePage findFiltered(String searchParam, int page, int size) {
        Specification<Notice> spec = notDeleted().and(matchesSearch(searchParam));
        Page<Notice> result = jpa.findAll(spec, PageRequest.of(page, size));
        return new NoticePage(result.getContent(), result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }

    @Override
    public long countActiveByCategoryAndCreatedAtAfter(String categoryName, OffsetDateTime after) {
        return jpa.countActiveByCategoryAndCreatedAtAfter(categoryName, after);
    }

    @Override
    public long countActiveByCategory(String categoryName) {
        return jpa.countActiveByCategory(categoryName);
    }

    @Override
    public Optional<String> findLatestActiveTitle() {
        List<String> results = jpa.findLatestActiveTitles(PageRequest.of(0, 1));
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    @Override
    public void deleteById(Integer id) {
        jpa.deleteById(id);
    }

    @Override
    public boolean existsById(Integer id) {
        return jpa.existsById(id);
    }

    private static Specification<Notice> notDeleted() {
        return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
    }

    private static Specification<Notice> matchesSearch(String searchParam) {
        if (searchParam == null || searchParam.isBlank()) return null;
        String pattern = "%" + searchParam + "%";
        return (root, query, cb) -> {
            HibernateCriteriaBuilder hcb = (HibernateCriteriaBuilder) cb;
            return cb.or(
                    hcb.ilike(root.<String>get("title"), pattern),
                    hcb.ilike(root.join("category", JoinType.INNER).<String>get("name"), pattern),
                    hcb.ilike(root.join("user", JoinType.INNER).<String>get("username"), pattern)
            );
        };
    }
}
