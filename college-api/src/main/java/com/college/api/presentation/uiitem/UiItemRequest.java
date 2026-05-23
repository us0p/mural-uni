package com.college.api.presentation.uiitem;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UiItemRequest(@NotBlank @Size(max = 20) String name) {}
