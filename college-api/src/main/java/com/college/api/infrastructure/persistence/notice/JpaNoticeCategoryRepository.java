package com.college.api.infrastructure.persistence.notice;

import com.college.api.domain.notice.NoticeCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaNoticeCategoryRepository extends JpaRepository<NoticeCategory, Integer> {
}
