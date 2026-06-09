package com.college.api.application.notice;

import com.college.api.application.exception.ResourceNotFoundException;
import com.college.api.domain.email.EmailPort;
import com.college.api.domain.notice.Notice;
import com.college.api.domain.notice.NoticeCategory;
import com.college.api.domain.notice.NoticeCategoryRepository;
import com.college.api.domain.notice.NoticePage;
import com.college.api.domain.notice.NoticeRepository;
import com.college.api.domain.notice.NoticeSubscriptionRepository;
import com.college.api.domain.notice.NoticeSubscriptionRepository.SubscriberInfo;
import com.college.api.domain.user.User;
import com.college.api.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private static final Logger log = LoggerFactory.getLogger(NoticeService.class);

    private final NoticeRepository noticeRepository;
    private final UserRepository userRepository;
    private final NoticeCategoryRepository noticeCategoryRepository;
    private final NoticeSubscriptionRepository noticeSubscriptionRepository;
    private final EmailPort emailPort;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Transactional(readOnly = true)
    public NoticePage findFiltered(String searchParam, int page, int size) {
        return noticeRepository.findFiltered(searchParam, page, size);
    }

    @Transactional(readOnly = true)
    public Notice findById(Integer id) {
        return noticeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notice", id));
    }

    @Transactional
    public Notice create(Integer userId, String title, String markdownContent, Integer categoryId, String coverImgUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        NoticeCategory category = noticeCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("NoticeCategory", categoryId));
        OffsetDateTime now = OffsetDateTime.now();
        Notice notice = Notice.builder()
                .user(user)
                .title(title)
                .markdownContent(markdownContent)
                .coverImgUrl(coverImgUrl)
                .category(category)
                .createdAt(now)
                .updatedAt(now)
                .build();
        Notice saved = noticeRepository.save(notice);
        try {
            sendNoticeNotifications(saved);
        } catch (Exception e) {
            log.warn("Failed to dispatch notice notifications for notice {}: {}", saved.getId(), e.getClass().getSimpleName());
        }
        return saved;
    }

    private void sendNoticeNotifications(Notice notice) {
        List<SubscriberInfo> subscribers =
                noticeSubscriptionRepository.findSubscribersByCategoryId(notice.getCategory().getId());
        if (subscribers.isEmpty()) return;

        String noticeUrl = frontendUrl + "/blog/" + notice.getId();
        String preferencesUrl = frontendUrl + "/aluno/preferencias";

        for (SubscriberInfo subscriber : subscribers) {
            try {
                emailPort.sendNoticeNotificationEmail(
                        subscriber.email(),
                        subscriber.username(),
                        notice.getTitle(),
                        notice.getCategory().getName(),
                        noticeUrl,
                        preferencesUrl
                );
            } catch (Exception e) {
                log.warn("Failed to send notice notification to '{}': {}", subscriber.email(), e.getClass().getSimpleName());
            }
        }
    }

    @Transactional
    public Notice update(Integer id, String title, String markdownContent, Integer categoryId, String coverImgUrl) {
        Notice notice = findById(id);
        NoticeCategory category = noticeCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("NoticeCategory", categoryId));
        notice.setTitle(title);
        notice.setMarkdownContent(markdownContent);
        notice.setCoverImgUrl(coverImgUrl);
        notice.setCategory(category);
        notice.setUpdatedAt(OffsetDateTime.now());
        return noticeRepository.save(notice);
    }

    @Transactional
    public void softDelete(Integer id) {
        Notice notice = findById(id);
        notice.setDeletedAt(OffsetDateTime.now());
        noticeRepository.save(notice);
    }

    @Transactional
    public void hardDelete(Integer id) {
        if (!noticeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notice", id);
        }
        noticeRepository.deleteById(id);
    }
}
