package com.college.api.presentation.notice;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NoticeCategoryRequest(@NotBlank @Size(max = 20) String name) {}
