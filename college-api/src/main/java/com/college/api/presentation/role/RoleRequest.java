package com.college.api.presentation.role;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RoleRequest(@NotBlank @Size(max = 20) String name) {}
