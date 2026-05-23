package com.college.api.infrastructure.embedding;

import com.college.api.domain.document.DocumentTextExtractor;
import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@Component
public class TikaTextExtractorAdapter implements DocumentTextExtractor {

    private final Tika tika = new Tika();

    @Override
    public String extract(byte[] content, String contentType) {
        try {
            return tika.parseToString(new ByteArrayInputStream(content));
        } catch (TikaException | IOException e) {
            throw new RuntimeException("Failed to extract text from document", e);
        }
    }
}
