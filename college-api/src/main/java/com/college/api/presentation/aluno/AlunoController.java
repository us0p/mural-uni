package com.college.api.presentation.aluno;

import com.college.api.application.aluno.AlunoService;
import com.college.api.infrastructure.security.UserPrincipal;
import com.college.api.presentation.notice.NoticeCategoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/aluno")
@RequiredArgsConstructor
public class AlunoController {

    private final AlunoService alunoService;

    @GetMapping("/dashboard")
    public AlunoStatsResponse getDashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return AlunoStatsResponse.from(alunoService.getDashboard(principal.userId()));
    }

    @GetMapping("/subscriptions")
    public List<NoticeCategoryResponse> getSubscriptions(@AuthenticationPrincipal UserPrincipal principal) {
        return alunoService.getSubscriptions(principal.userId())
                .stream()
                .map(NoticeCategoryResponse::from)
                .toList();
    }

    @PutMapping("/subscriptions")
    public ResponseEntity<Void> setSubscriptions(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody SubscriptionRequest request) {
        alunoService.setSubscriptions(principal.userId(), request.categoryIds());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/presences")
    public List<NoticeWithPresenceResponse> getPresences(@AuthenticationPrincipal UserPrincipal principal) {
        return alunoService.getPresences(principal.userId())
                .stream()
                .map(NoticeWithPresenceResponse::from)
                .toList();
    }

    @PostMapping("/presences/{noticeId}")
    public ResponseEntity<Void> markPresence(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer noticeId) {
        alunoService.markPresence(principal.userId(), noticeId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @DeleteMapping("/presences/{noticeId}")
    public ResponseEntity<Void> removePresence(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer noticeId) {
        alunoService.removePresence(principal.userId(), noticeId);
        return ResponseEntity.noContent().build();
    }
}
