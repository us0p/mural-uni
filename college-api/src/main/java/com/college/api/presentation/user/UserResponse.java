package com.college.api.presentation.user;

import com.college.api.domain.user.User;

public record UserResponse(Integer id, String username, String email, String phoneNumber, Integer roleId, String roleName, String ra) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole().getId(),
                user.getRole().getName(),
                user.getRa()
        );
    }
}
