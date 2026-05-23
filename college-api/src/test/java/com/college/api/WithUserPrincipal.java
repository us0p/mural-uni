package com.college.api;

import org.springframework.security.test.context.support.WithSecurityContext;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = WithUserPrincipalSecurityContextFactory.class)
public @interface WithUserPrincipal {
    int userId() default 1;
    String username() default "alice";
    String[] authorities() default {"admin"};
}
