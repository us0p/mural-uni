package com.college.api.application.stats;

import com.college.api.domain.notice.NoticeRepository;
import com.college.api.domain.user.UserRepository;
import com.college.api.presentation.stats.StatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final NoticeRepository noticeRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public StatsResponse getStats() {
        return new StatsResponse(
                noticeRepository.countActiveByCategoryAndCreatedAtAfter("evento", OffsetDateTime.now().minusMonths(6)),
                noticeRepository.countActiveByCategory("estágio"),
                userRepository.countByRoleName("aluno"),
                noticeRepository.findLatestActiveTitle().orElse(null)
        );
    }
}
