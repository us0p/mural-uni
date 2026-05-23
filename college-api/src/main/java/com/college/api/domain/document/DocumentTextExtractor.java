package com.college.api.domain.document;

public interface DocumentTextExtractor {
    String extract(byte[] content, String contentType);
}
