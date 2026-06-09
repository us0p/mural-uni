package com.college.api.infrastructure.persistence.notice;

import com.college.api.domain.notice.EventPresence;
import com.college.api.domain.notice.EventPresenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class EventPresenceRepositoryAdapter implements EventPresenceRepository {

    private final JpaEventPresenceRepository jpa;

    @Override
    public List<EventPresence> findByUserId(Integer userId) {
        return jpa.findByUserId(userId);
    }

    @Override
    public Optional<EventPresence> findByUserIdAndNoticeId(Integer userId, Integer noticeId) {
        return jpa.findByUserIdAndNoticeId(userId, noticeId);
    }

    @Override
    public EventPresence save(EventPresence presence) {
        return jpa.save(presence);
    }

    @Override
    public void deleteByUserIdAndNoticeId(Integer userId, Integer noticeId) {
        jpa.deleteByUserIdAndNoticeId(userId, noticeId);
    }

    @Override
    public long countByUserId(Integer userId) {
        return jpa.countByUserId(userId);
    }
}
