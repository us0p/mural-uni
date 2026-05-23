package com.college.api.domain.notice;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface NoticeRepository {
    Notice save(Notice notice);
    Optional<Notice> findById(Integer id);
    NoticePage findFiltered(String searchParam, int page, int size);
    long countActiveByCategoryAndCreatedAtAfter(String categoryName, OffsetDateTime after);
    long countActiveByCategory(String categoryName);
    Optional<String> findLatestActiveTitle();
    void deleteById(Integer id);
    boolean existsById(Integer id);
}
