package com.college.api.infrastructure.storage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LocalDocumentStorageAdapterTest {

    @TempDir
    Path tempDir;

    private LocalDocumentStorageAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new LocalDocumentStorageAdapter(tempDir);
    }

    @Test
    void upload_writesFileAndReturnsKey() throws Exception {
        byte[] content = {1, 2, 3};

        String key = adapter.upload("report.pdf", content, "application/pdf");

        assertThat(key).endsWith("_report.pdf");
        assertThat(Files.readAllBytes(tempDir.resolve(key))).isEqualTo(content);
    }

    @Test
    void upload_keyHasUuidPrefix() {
        String key = adapter.upload("file.txt", new byte[]{42}, "text/plain");

        String[] parts = key.split("_", 2);
        assertThat(parts).hasSize(2);
        assertThat(parts[1]).isEqualTo("file.txt");
    }

    @Test
    void upload_whenDirectoryDoesNotExist_throwsException() {
        Path nonExistent = tempDir.resolve("missing").resolve("subdir");
        LocalDocumentStorageAdapter badAdapter = new LocalDocumentStorageAdapter(nonExistent);

        assertThatThrownBy(() -> badAdapter.upload("f.pdf", new byte[1], "application/pdf"))
                .isInstanceOf(UncheckedIOException.class)
                .hasMessageContaining("Failed to write document");
    }

    @Test
    void delete_removesFileFromDisk() throws Exception {
        byte[] content = {9, 8, 7};
        String key = adapter.upload("doc.pdf", content, "application/pdf");
        assertThat(tempDir.resolve(key)).exists();

        adapter.delete(key);

        assertThat(tempDir.resolve(key)).doesNotExist();
    }

    @Test
    void delete_whenFileNotFound_doesNotThrow() {
        adapter.delete("nonexistent_file.pdf");
    }

    @Test
    void download_returnsFileBytes() {
        byte[] content = {5, 6, 7};
        String key = adapter.upload("sample.txt", content, "text/plain");

        assertThat(adapter.download(key)).isEqualTo(content);
    }

    @Test
    void download_whenFileNotFound_throwsException() {
        assertThatThrownBy(() -> adapter.download("missing_file.pdf"))
                .isInstanceOf(UncheckedIOException.class)
                .hasMessageContaining("Failed to read document");
    }
}
