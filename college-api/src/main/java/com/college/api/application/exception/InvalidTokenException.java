package com.college.api.application.exception;

public class InvalidTokenException extends RuntimeException {
    public InvalidTokenException() {
        super("Token inválido, expirado ou já utilizado");
    }
}
