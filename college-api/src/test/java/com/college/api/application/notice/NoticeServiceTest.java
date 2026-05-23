package com.college.api.application.notice;

import com.college.api.application.exception.ResourceNotFoundException;
import com.college.api.domain.notice.Notice;
import com.college.api.domain.notice.NoticeCategory;
import com.college.api.domain.notice.NoticeCategoryRepository;
import com.college.api.domain.notice.NoticePage;
import com.college.api.domain.notice.NoticeRepository;
import com.college.api.domain.role.Role;
import com.college.api.domain.user.User;
import com.college.api.domain.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NoticeServiceTest {

    @Mock private NoticeRepository noticeRepository;
    @Mock private UserRepository userRepository;
    @Mock private NoticeCategoryRepository noticeCategoryRepository;

    @InjectMocks
    private NoticeService service;

    private final User user = User.builder().id(1).username("alice")
            .role(Role.builder().id(1).name("student").build()).build();
    private final NoticeCategory category = NoticeCategory.builder().id(1).name("general").build();

    private Notice buildNotice() {
        return Notice.builder().id(1).user(user).title("Hello").markdownContent("# Hello")
                .category(category).createdAt(OffsetDateTime.now()).updatedAt(OffsetDateTime.now()).build();
    }

    // ── findFiltered ──────────────────────────────────────────────────────────

    @Test
    void findFiltered_withNoSearch_delegatesToRepository() {
        var expected = new NoticePage(List.of(buildNotice()), 0, 10, 1, 1);
        when(noticeRepository.findFiltered(null, 0, 10)).thenReturn(expected);

        NoticePage result = service.findFiltered(null, 0, 10);

        assertThat(result.content()).hasSize(1);
        assertThat(result.totalElements()).isEqualTo(1);
        verify(noticeRepository).findFiltered(null, 0, 10);
    }

    @Test
    void findFiltered_withSearchParam_delegatesCorrectArgs() {
        var expected = new NoticePage(List.of(buildNotice()), 0, 10, 1, 1);
        when(noticeRepository.findFiltered("hello", 0, 10)).thenReturn(expected);

        NoticePage result = service.findFiltered("hello", 0, 10);

        assertThat(result.content()).hasSize(1);
        verify(noticeRepository).findFiltered("hello", 0, 10);
    }

    @Test
    void findFiltered_withPagination_delegatesCorrectPageAndSize() {
        var expected = new NoticePage(List.of(), 2, 5, 0, 0);
        when(noticeRepository.findFiltered(null, 2, 5)).thenReturn(expected);

        NoticePage result = service.findFiltered(null, 2, 5);

        assertThat(result.page()).isEqualTo(2);
        assertThat(result.size()).isEqualTo(5);
        verify(noticeRepository).findFiltered(null, 2, 5);
    }

    @Test
    void findFiltered_withNoResults_returnsEmptyPage() {
        var expected = new NoticePage(List.of(), 0, 10, 0, 0);
        when(noticeRepository.findFiltered("nonexistent", 0, 10)).thenReturn(expected);

        NoticePage result = service.findFiltered("nonexistent", 0, 10);

        assertThat(result.content()).isEmpty();
        assertThat(result.totalElements()).isEqualTo(0);
        assertThat(result.totalPages()).isEqualTo(0);
    }

    // ── findById ─────────────────────────────────────────────────────────────

    @Test
    void findById_whenExists_returnsNotice() {
        Notice notice = buildNotice();
        when(noticeRepository.findById(1)).thenReturn(Optional.of(notice));

        assertThat(service.findById(1)).isEqualTo(notice);
    }

    @Test
    void findById_whenNotFound_throwsResourceNotFoundException() {
        when(noticeRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(99))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── create ───────────────────────────────────────────────────────────────

    @Test
    void create_whenUserAndCategoryExist_savesNotice() {
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(noticeCategoryRepository.findById(1)).thenReturn(Optional.of(category));
        Notice saved = buildNotice();
        when(noticeRepository.save(any())).thenReturn(saved);

        Notice result = service.create(1, "Hello", "# Hello", 1, null);

        assertThat(result.getTitle()).isEqualTo("Hello");
        assertThat(result.getMarkdownContent()).isEqualTo("# Hello");
        assertThat(result.getDeletedAt()).isNull();
    }

    @Test
    void create_whenUserNotFound_throwsResourceNotFoundException() {
        when(userRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(99, "Hello", "# Hello", 1, null))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_whenCategoryNotFound_throwsResourceNotFoundException() {
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(noticeCategoryRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(1, "Hello", "# Hello", 99, null))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── update ───────────────────────────────────────────────────────────────

    @Test
    void update_updatesTitleMarkdownAndCategory() {
        Notice existing = buildNotice();
        NoticeCategory newCategory = NoticeCategory.builder().id(2).name("tech").build();
        when(noticeRepository.findById(1)).thenReturn(Optional.of(existing));
        when(noticeCategoryRepository.findById(2)).thenReturn(Optional.of(newCategory));
        when(noticeRepository.save(existing)).thenReturn(existing);

        Notice result = service.update(1, "New", "new", 2, "http://img.url");

        assertThat(result.getTitle()).isEqualTo("New");
        assertThat(result.getMarkdownContent()).isEqualTo("new");
        assertThat(result.getCoverImgUrl()).isEqualTo("http://img.url");
        assertThat(result.getCategory().getName()).isEqualTo("tech");
    }

    // ── softDelete ────────────────────────────────────────────────────────────

    @Test
    void softDelete_setsDeletedAt() {
        Notice existing = buildNotice();
        when(noticeRepository.findById(1)).thenReturn(Optional.of(existing));
        when(noticeRepository.save(any())).thenReturn(existing);

        service.softDelete(1);

        assertThat(existing.getDeletedAt()).isNotNull();
        verify(noticeRepository).save(existing);
    }

    // ── hardDelete ────────────────────────────────────────────────────────────

    @Test
    void hardDelete_whenExists_deletesById() {
        when(noticeRepository.existsById(1)).thenReturn(true);

        service.hardDelete(1);

        verify(noticeRepository).deleteById(1);
    }
}
