package com.college.api.application.user;

import com.college.api.application.exception.ResourceNotFoundException;
import com.college.api.domain.email.EmailPort;
import com.college.api.domain.passwordreset.PasswordResetTokenRepository;
import com.college.api.domain.role.Role;
import com.college.api.domain.role.RoleRepository;
import com.college.api.domain.user.User;
import com.college.api.domain.user.UserPage;
import com.college.api.domain.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private EmailPort emailPort;
    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;

    @InjectMocks
    private UserService service;

    private final Role role = Role.builder().id(1).name("student").build();

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "frontendUrl", "http://localhost:3000");
        ReflectionTestUtils.setField(service, "tokenExpiryHours", 24);
    }

    @Test
    void findFiltered_returnsPage() {
        UserPage page = new UserPage(
                List.of(User.builder().id(1).username("alice").role(role).build()),
                0, 10, 1, 1
        );
        when(userRepository.findFiltered(null, 0, 10)).thenReturn(page);

        UserPage result = service.findFiltered(null, 0, 10);

        assertThat(result.content()).hasSize(1);
        assertThat(result.totalElements()).isEqualTo(1);
    }

    @Test
    void findById_whenExists_returnsUser() {
        User user = User.builder().id(1).username("alice").role(role).build();
        when(userRepository.findById(1)).thenReturn(Optional.of(user));

        assertThat(service.findById(1)).isEqualTo(user);
    }

    @Test
    void findById_whenNotFound_throwsResourceNotFoundException() {
        when(userRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(99))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_whenRoleExists_savesUser() {
        when(roleRepository.findById(1)).thenReturn(Optional.of(role));
        User saved = User.builder().id(1).username("alice")
                .email("alice@example.com").phoneNumber("11999990000").role(role).ra("RA001").build();
        when(userRepository.save(any())).thenReturn(saved);

        User result = service.create("alice", "alice@example.com", "11999990000", 1, "RA001");

        assertThat(result.getUsername()).isEqualTo("alice");
        assertThat(result.getEmail()).isEqualTo("alice@example.com");
        assertThat(result.getPhoneNumber()).isEqualTo("11999990000");
        assertThat(result.getRa()).isEqualTo("RA001");
        verifyNoInteractions(emailPort);
    }

    @Test
    void create_whenRoleNotFound_throwsResourceNotFoundException() {
        when(roleRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create("alice", "alice@example.com", null, 99, null))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void sendSetPasswordEmail_savesTokenAndSendsEmail() {
        User user = User.builder().id(1).username("alice").email("alice@example.com").role(role).build();
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(passwordResetTokenRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        service.sendSetPasswordEmail(1, "alice@example.com", "alice");

        verify(passwordResetTokenRepository).save(any());
        verify(emailPort).sendSetPasswordEmail(eq("alice@example.com"), eq("alice"),
                argThat(url -> url.startsWith("http://localhost:3000/criar-senha?token=")));
    }

    @Test
    void sendSetPasswordEmail_logsWarningOnEmailFailure() {
        User user = User.builder().id(1).username("alice").email("alice@example.com").role(role).build();
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(passwordResetTokenRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        doThrow(new RuntimeException("SES error")).when(emailPort).sendSetPasswordEmail(any(), any(), any());

        assertThatNoException().isThrownBy(
                () -> service.sendSetPasswordEmail(1, "alice@example.com", "alice"));
    }

    @Test
    void update_updatesFields() {
        Role newRole = Role.builder().id(2).name("admin").build();
        User existing = User.builder().id(1).username("alice")
                .email("alice@example.com").role(role).build();
        when(userRepository.findById(1)).thenReturn(Optional.of(existing));
        when(roleRepository.findById(2)).thenReturn(Optional.of(newRole));
        when(userRepository.save(existing)).thenReturn(existing);

        User result = service.update(1, "bob", "bob@example.com", "11888880000", 2, "RA002");

        assertThat(result.getUsername()).isEqualTo("bob");
        assertThat(result.getRole()).isEqualTo(newRole);
        assertThat(result.getEmail()).isEqualTo("bob@example.com");
    }

    @Test
    void delete_whenExists_deletesById() {
        when(userRepository.existsById(1)).thenReturn(true);

        service.delete(1, 99);

        verify(userRepository).deleteById(1);
    }

    @Test
    void delete_selfDelete_throwsForbiddenOperationException() {
        assertThatThrownBy(() -> service.delete(1, 1))
                .isInstanceOf(com.college.api.application.exception.ForbiddenOperationException.class);
        verify(userRepository, never()).deleteById(any());
    }
}
