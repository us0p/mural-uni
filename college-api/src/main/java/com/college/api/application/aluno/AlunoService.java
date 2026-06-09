package com.college.api.application.aluno;

import com.college.api.application.exception.ForbiddenOperationException;
import com.college.api.application.exception.ResourceNotFoundException;
import com.college.api.domain.notice.EventPresence;
import com.college.api.domain.notice.EventPresenceRepository;
import com.college.api.domain.notice.Notice;
import com.college.api.domain.notice.NoticeCategory;
import com.college.api.domain.notice.NoticeCategoryRepository;
import com.college.api.domain.notice.NoticeRepository;
import com.college.api.domain.notice.NoticeSubscription;
import com.college.api.domain.notice.NoticeSubscriptionRepository;
import com.college.api.domain.user.User;
import com.college.api.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlunoService {

    private final UserRepository userRepository;
    private final NoticeCategoryRepository noticeCategoryRepository;
    private final NoticeSubscriptionRepository noticeSubscriptionRepository;
    private final NoticeRepository noticeRepository;
    private final EventPresenceRepository eventPresenceRepository;

    public record NoticeWithPresence(Notice notice, boolean attended) {}
    public record AlunoStats(long eventsAttended, long daysOnPlatform) {}

    @Transactional(readOnly = true)
    public List<NoticeCategory> getSubscriptions(Integer userId) {
        return noticeSubscriptionRepository.findByUserId(userId)
                .stream()
                .map(NoticeSubscription::getCategory)
                .toList();
    }

    @Transactional
    public void setSubscriptions(Integer userId, List<Integer> categoryIds) {
        noticeSubscriptionRepository.deleteByUserId(userId);
        for (Integer categoryId : categoryIds) {
            NoticeCategory category = noticeCategoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("NoticeCategory", categoryId));
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", userId));
            noticeSubscriptionRepository.save(NoticeSubscription.builder()
                    .user(user)
                    .category(category)
                    .build());
        }
    }

    @Transactional(readOnly = true)
    public List<NoticeWithPresence> getPresences(Integer userId) {
        List<Notice> eventoNotices = noticeRepository.findActiveByCategory("evento");
        Set<Integer> attendedIds = eventPresenceRepository.findByUserId(userId)
                .stream()
                .map(ep -> ep.getNotice().getId())
                .collect(Collectors.toSet());
        return eventoNotices.stream()
                .map(n -> new NoticeWithPresence(n, attendedIds.contains(n.getId())))
                .toList();
    }

    @Transactional
    public void markPresence(Integer userId, Integer noticeId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new ResourceNotFoundException("Notice", noticeId));
        if (!"evento".equalsIgnoreCase(notice.getCategory().getName())) {
            throw new ForbiddenOperationException("Presence can only be marked for 'evento' notices");
        }
        boolean alreadyMarked = eventPresenceRepository.findByUserIdAndNoticeId(userId, noticeId).isPresent();
        if (!alreadyMarked) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", userId));
            eventPresenceRepository.save(EventPresence.builder()
                    .user(user)
                    .notice(notice)
                    .markedAt(OffsetDateTime.now())
                    .build());
        }
    }

    @Transactional
    public void removePresence(Integer userId, Integer noticeId) {
        eventPresenceRepository.deleteByUserIdAndNoticeId(userId, noticeId);
    }

    @Transactional(readOnly = true)
    public AlunoStats getDashboard(Integer userId) {
        long eventsAttended = eventPresenceRepository.countByUserId(userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        long daysOnPlatform = 0;
        if (user.getFirstLoginAt() != null) {
            daysOnPlatform = ChronoUnit.DAYS.between(user.getFirstLoginAt(), OffsetDateTime.now());
        }
        return new AlunoStats(eventsAttended, daysOnPlatform);
    }
}
