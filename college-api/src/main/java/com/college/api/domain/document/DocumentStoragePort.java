package com.college.api.domain.document;

public interface DocumentStoragePort {
    String upload(String fileName, byte[] content, String contentType);
    void delete(String key);
    byte[] download(String key);
}
