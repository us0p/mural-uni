package com.college.api.infrastructure.persistence.notice;

import com.college.api.domain.notice.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;

public interface JpaNoticeRepository extends JpaRepository<Notice, Integer>, JpaSpecificationExecutor<Notice> {

    @Query("SELECT COUNT(n) FROM Notice n WHERE n.deletedAt IS NULL AND LOWER(n.category.name) = LOWER(:categoryName) AND n.createdAt >= :after")
    long countActiveByCategoryAndCreatedAtAfter(@Param("categoryName") String categoryName, @Param("after") OffsetDateTime after);

    @Query("SELECT COUNT(n) FROM Notice n WHERE n.deletedAt IS NULL AND LOWER(n.category.name) = LOWER(:categoryName)")
    long countActiveByCategory(@Param("categoryName") String categoryName);

    @Query("SELECT n.title FROM Notice n WHERE n.deletedAt IS NULL ORDER BY n.createdAt DESC")
    List<String> findLatestActiveTitles(Pageable pageable);

    @Query("SELECT n FROM Notice n WHERE n.deletedAt IS NULL AND LOWER(n.category.name) = LOWER(:categoryName) ORDER BY n.createdAt DESC")
    List<Notice> findActiveByCategory(@Param("categoryName") String categoryName);
}
