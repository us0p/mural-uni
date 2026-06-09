package com.college.api.infrastructure.persistence.notice;

import com.college.api.domain.notice.NoticeSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

interface SubscriberProjection {
    String getEmail();
    String getUsername();
}

public interface JpaNoticeSubscriptionRepository extends JpaRepository<NoticeSubscription, Integer> {

    @Query("SELECT s FROM NoticeSubscription s WHERE s.user.id = :userId")
    List<NoticeSubscription> findByUserId(@Param("userId") Integer userId);

    @Modifying
    @Query("DELETE FROM NoticeSubscription s WHERE s.user.id = :userId")
    void deleteByUserId(@Param("userId") Integer userId);

    @Query("SELECT s.user.email AS email, s.user.username AS username FROM NoticeSubscription s WHERE s.category.id = :categoryId")
    List<SubscriberProjection> findSubscribersByCategoryId(@Param("categoryId") Integer categoryId);
}
