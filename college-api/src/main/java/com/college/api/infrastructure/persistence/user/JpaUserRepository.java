package com.college.api.infrastructure.persistence.user;

import com.college.api.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.Optional;

public interface JpaUserRepository extends JpaRepository<User, Integer>, JpaSpecificationExecutor<User> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    @Query("SELECT COUNT(u) FROM User u WHERE LOWER(u.role.name) = LOWER(:roleName)")
    long countByRoleName(@Param("roleName") String roleName);

    @Modifying
    @Query("UPDATE User u SET u.tokenVersion = u.tokenVersion + 1 WHERE u.id = :userId")
    void incrementTokenVersion(@Param("userId") Integer userId);

    @Modifying
    @Query("UPDATE User u SET u.firstLoginAt = :ts WHERE u.id = :userId AND u.firstLoginAt IS NULL")
    void updateFirstLoginAt(@Param("userId") Integer userId, @Param("ts") OffsetDateTime ts);
}
