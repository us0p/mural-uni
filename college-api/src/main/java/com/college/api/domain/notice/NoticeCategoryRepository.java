package com.college.api.domain.notice;

import java.util.List;
import java.util.Optional;

public interface NoticeCategoryRepository {
    NoticeCategory save(NoticeCategory noticeCategory);
    Optional<NoticeCategory> findById(Integer id);
    List<NoticeCategory> findAll();
    void deleteById(Integer id);
    boolean existsById(Integer id);
}
