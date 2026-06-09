package com.college.api.presentation.aluno;

import com.college.api.application.aluno.AlunoService.NoticeWithPresence;
import com.college.api.presentation.notice.NoticeResponse;

public record NoticeWithPresenceResponse(NoticeResponse notice, boolean attended) {

    public static NoticeWithPresenceResponse from(NoticeWithPresence nwp) {
        return new NoticeWithPresenceResponse(NoticeResponse.from(nwp.notice()), nwp.attended());
    }
}
