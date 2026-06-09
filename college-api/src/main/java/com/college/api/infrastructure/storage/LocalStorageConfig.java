package com.college.api.infrastructure.storage;

import com.college.api.domain.document.DocumentStoragePort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Configuration
public class LocalStorageConfig {

    @Value("${storage.path:/app/documents}")
    private String storagePath;

    @Bean
    public DocumentStoragePort localDocumentStorageAdapter() {
        Path dir = Path.of(storagePath);
        try {
            Files.createDirectories(dir);
        } catch (IOException e) {
            throw new UncheckedIOException("Cannot create document storage directory: " + dir, e);
        }
        return new LocalDocumentStorageAdapter(dir);
    }
}
