package com.college.api.infrastructure.persistence.notice;

import com.college.api.domain.notice.EventPresence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JpaEventPresenceRepository extends JpaRepository<EventPresence, Integer> {

    @Query("SELECT ep FROM EventPresence ep WHERE ep.user.id = :userId")
    List<EventPresence> findByUserId(@Param("userId") Integer userId);

    @Query("SELECT ep FROM EventPresence ep WHERE ep.user.id = :userId AND ep.notice.id = :noticeId")
    Optional<EventPresence> findByUserIdAndNoticeId(@Param("userId") Integer userId, @Param("noticeId") Integer noticeId);

    @Modifying
    @Query("DELETE FROM EventPresence ep WHERE ep.user.id = :userId AND ep.notice.id = :noticeId")
    void deleteByUserIdAndNoticeId(@Param("userId") Integer userId, @Param("noticeId") Integer noticeId);

    @Query("SELECT COUNT(ep) FROM EventPresence ep WHERE ep.user.id = :userId")
    long countByUserId(@Param("userId") Integer userId);
}
