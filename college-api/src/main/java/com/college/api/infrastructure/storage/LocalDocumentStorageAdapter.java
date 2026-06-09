package com.college.api.infrastructure.storage;

import com.college.api.domain.document.DocumentStoragePort;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.util.UUID;

public class LocalDocumentStorageAdapter implements DocumentStoragePort {

    private final Path storageDir;

    public LocalDocumentStorageAdapter(Path storageDir) {
        this.storageDir = storageDir;
    }

    @Override
    public String upload(String fileName, byte[] content, String contentType) {
        String key = UUID.randomUUID() + "_" + fileName;
        try {
            Files.write(storageDir.resolve(key), content);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to write document: " + key, e);
        }
        return key;
    }

    @Override
    public void delete(String key) {
        try {
            Files.delete(storageDir.resolve(key));
        } catch (NoSuchFileException ignored) {
            // already gone — treat as success
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to delete document: " + key, e);
        }
    }

    @Override
    public byte[] download(String key) {
        try {
            return Files.readAllBytes(storageDir.resolve(key));
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to read document: " + key, e);
        }
    }
}
