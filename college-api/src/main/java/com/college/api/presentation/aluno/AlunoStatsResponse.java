package com.college.api.presentation.aluno;

import com.college.api.application.aluno.AlunoService.AlunoStats;

public record AlunoStatsResponse(long eventsAttended, long daysOnPlatform) {

    public static AlunoStatsResponse from(AlunoStats stats) {
        return new AlunoStatsResponse(stats.eventsAttended(), stats.daysOnPlatform());
    }
}
