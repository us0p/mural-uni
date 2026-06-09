package com.college.api.domain.notice;

import java.util.List;

public interface NoticeSubscriptionRepository {
    List<NoticeSubscription> findByUserId(Integer userId);
    void deleteByUserId(Integer userId);
    NoticeSubscription save(NoticeSubscription subscription);

    record SubscriberInfo(String email, String username) {}
    List<SubscriberInfo> findSubscribersByCategoryId(Integer categoryId);
}
