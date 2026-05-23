package com.college.api.infrastructure.embedding;

import com.college.api.domain.document.TextSplitter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class FixedSizeTextSplitter implements TextSplitter {

    private final int chunkSize;
    private final int chunkOverlap;

    public FixedSizeTextSplitter(
            @Value("${text.splitter.chunk-size:1000}") int chunkSize,
            @Value("${text.splitter.chunk-overlap:200}") int chunkOverlap) {
        if (chunkOverlap >= chunkSize) {
            throw new IllegalArgumentException("chunkOverlap must be less than chunkSize");
        }
        this.chunkSize = chunkSize;
        this.chunkOverlap = chunkOverlap;
    }

    @Override
    public List<String> split(String text) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.isBlank()) return chunks;

        String normalized = text.strip();
        int start = 0;

        while (start < normalized.length()) {
            int end = Math.min(start + chunkSize, normalized.length());

            if (end < normalized.length()) {
                int boundary = findBreakPoint(normalized, start, end);
                if (boundary > start) end = boundary;
            }

            String chunk = normalized.substring(start, end).strip();
            if (!chunk.isBlank()) chunks.add(chunk);

            if (end == normalized.length()) break;
            start = end - chunkOverlap;
        }

        return chunks;
    }

    // Prefer breaking at paragraph > newline > sentence > word boundaries.
    private int findBreakPoint(String text, int start, int end) {
        int midpoint = start + chunkSize / 2;

        int paragraphBreak = text.lastIndexOf("\n\n", end);
        if (paragraphBreak > midpoint) return paragraphBreak + 2;

        int newline = text.lastIndexOf('\n', end);
        if (newline > midpoint) return newline + 1;

        int sentence = text.lastIndexOf(". ", end);
        if (sentence > midpoint) return sentence + 2;

        int space = text.lastIndexOf(' ', end);
        if (space > start) return space + 1;

        return end;
    }
}
