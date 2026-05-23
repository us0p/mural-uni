package com.college.api.presentation.notice;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record NoticeUpdateRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 50_000) String markdownContent,
        @NotNull Integer categoryId,
        String coverImgUrl
) {}
