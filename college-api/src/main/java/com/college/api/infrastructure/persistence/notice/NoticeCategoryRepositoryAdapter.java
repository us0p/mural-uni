package com.college.api.infrastructure.persistence.notice;

import com.college.api.domain.notice.NoticeCategory;
import com.college.api.domain.notice.NoticeCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class NoticeCategoryRepositoryAdapter implements NoticeCategoryRepository {

    private final JpaNoticeCategoryRepository jpa;

    @Override
    public NoticeCategory save(NoticeCategory noticeCategory) {
        return jpa.save(noticeCategory);
    }

    @Override
    public Optional<NoticeCategory> findById(Integer id) {
        return jpa.findById(id);
    }

    @Override
    public List<NoticeCategory> findAll() {
        return jpa.findAll();
    }

    @Override
    public void deleteById(Integer id) {
        jpa.deleteById(id);
    }

    @Override
    public boolean existsById(Integer id) {
        return jpa.existsById(id);
    }
}
