package com.college.api.presentation.role;

import com.college.api.domain.role.RoleRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Roles", description = "Static role listing")
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleRepository repository;

    @Operation(summary = "List all available roles")
    @PreAuthorize("hasAnyAuthority('admin', 'professor', 'aluno')")
    @GetMapping
    public List<RoleResponse> findAll() {
        return repository.findAll().stream().map(RoleResponse::from).toList();
    }
}
