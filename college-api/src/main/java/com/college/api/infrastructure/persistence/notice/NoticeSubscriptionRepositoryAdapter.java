package com.college.api.infrastructure.persistence.notice;

import com.college.api.domain.notice.NoticeSubscription;
import com.college.api.domain.notice.NoticeSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class NoticeSubscriptionRepositoryAdapter implements NoticeSubscriptionRepository {

    private final JpaNoticeSubscriptionRepository jpa;

    @Override
    public List<NoticeSubscription> findByUserId(Integer userId) {
        return jpa.findByUserId(userId);
    }

    @Override
    public void deleteByUserId(Integer userId) {
        jpa.deleteByUserId(userId);
    }

    @Override
    public NoticeSubscription save(NoticeSubscription subscription) {
        return jpa.save(subscription);
    }

    @Override
    public List<NoticeSubscriptionRepository.SubscriberInfo> findSubscribersByCategoryId(Integer categoryId) {
        return jpa.findSubscribersByCategoryId(categoryId)
                .stream()
                .map(p -> new NoticeSubscriptionRepository.SubscriberInfo(p.getEmail(), p.getUsername()))
                .collect(Collectors.toList());
    }
}
