package com.college.api.application.stats;

import com.college.api.domain.notice.NoticeRepository;
import com.college.api.domain.user.UserRepository;
import com.college.api.presentation.stats.StatsResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StatsServiceTest {

    @Mock private NoticeRepository noticeRepository;
    @Mock private UserRepository userRepository;
    @InjectMocks private StatsService service;

    @Test
    void getStats_returnsAllCountsAndLatestTitle() {
        when(noticeRepository.countActiveByCategoryAndCreatedAtAfter(eq("evento"), any())).thenReturn(5L);
        when(noticeRepository.countActiveByCategory("estágio")).thenReturn(12L);
        when(userRepository.countByRoleName("aluno")).thenReturn(42L);
        when(noticeRepository.findLatestActiveTitle()).thenReturn(Optional.of("Latest Notice"));

        StatsResponse result = service.getStats();

        assertThat(result.semesterEventCount()).isEqualTo(5L);
        assertThat(result.jobPostCount()).isEqualTo(12L);
        assertThat(result.connectedStudents()).isEqualTo(42L);
        assertThat(result.latestNews()).isEqualTo("Latest Notice");
    }

    @Test
    void getStats_whenNoNotices_latestNewsIsNull() {
        when(noticeRepository.countActiveByCategoryAndCreatedAtAfter(any(), any())).thenReturn(0L);
        when(noticeRepository.countActiveByCategory(any())).thenReturn(0L);
        when(userRepository.countByRoleName(any())).thenReturn(0L);
        when(noticeRepository.findLatestActiveTitle()).thenReturn(Optional.empty());

        StatsResponse result = service.getStats();

        assertThat(result.latestNews()).isNull();
        assertThat(result.semesterEventCount()).isZero();
        assertThat(result.jobPostCount()).isZero();
        assertThat(result.connectedStudents()).isZero();
    }

    @Test
    void getStats_usesLast6MonthsForEventCount() {
        when(noticeRepository.countActiveByCategoryAndCreatedAtAfter(eq("evento"), any())).thenReturn(3L);
        when(noticeRepository.countActiveByCategory(any())).thenReturn(0L);
        when(userRepository.countByRoleName(any())).thenReturn(0L);
        when(noticeRepository.findLatestActiveTitle()).thenReturn(Optional.empty());

        service.getStats();

        ArgumentCaptor<OffsetDateTime> captor = ArgumentCaptor.forClass(OffsetDateTime.class);
        verify(noticeRepository).countActiveByCategoryAndCreatedAtAfter(eq("evento"), captor.capture());
        OffsetDateTime captured = captor.getValue();
        assertThat(captured).isAfter(OffsetDateTime.now().minusMonths(6).minusSeconds(5));
        assertThat(captured).isBefore(OffsetDateTime.now().minusMonths(6).plusSeconds(5));
    }
}
