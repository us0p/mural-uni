package com.college.api;

import com.college.api.infrastructure.security.UserPrincipal;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;

import java.util.Arrays;

public class WithUserPrincipalSecurityContextFactory
        implements WithSecurityContextFactory<WithUserPrincipal> {

    @Override
    public SecurityContext createSecurityContext(WithUserPrincipal annotation) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        var principal = new UserPrincipal(annotation.username(), annotation.userId());
        var authorities = Arrays.stream(annotation.authorities())
                .map(SimpleGrantedAuthority::new)
                .toList();
        context.setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, authorities));
        return context;
    }
}
