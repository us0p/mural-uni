package com.college.api.domain.notice;

import java.util.List;
import java.util.Optional;

public interface EventPresenceRepository {
    List<EventPresence> findByUserId(Integer userId);
    Optional<EventPresence> findByUserIdAndNoticeId(Integer userId, Integer noticeId);
    EventPresence save(EventPresence presence);
    void deleteByUserIdAndNoticeId(Integer userId, Integer noticeId);
    long countByUserId(Integer userId);
}
