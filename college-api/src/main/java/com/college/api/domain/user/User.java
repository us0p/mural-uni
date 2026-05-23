package com.college.api.domain.user;

import com.college.api.domain.role.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = lombok.AccessLevel.PACKAGE)
@Builder
@EqualsAndHashCode(of = "id")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 20, unique = true, nullable = false)
    private String username;

    @Column(name = "password_hash", length = 60)
    private String passwordHash;

    @Column(length = 254, unique = true, nullable = false)
    private String email;

    @Column(name = "phone_number", length = 20, unique = true)
    private String phoneNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(length = 10, unique = true)
    private String ra;

    @Builder.Default
    @Column(name = "token_version", nullable = false)
    private int tokenVersion = 1;
}
