package com.college.api.infrastructure.storage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectResponse;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class S3DocumentStorageAdapterTest {

    @Mock private S3Client s3Client;

    private S3DocumentStorageAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new S3DocumentStorageAdapter(s3Client, "test-bucket", "us-east-1");
    }

    @Test
    void upload_putsObjectToS3AndReturnsUrl() {
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenReturn(PutObjectResponse.builder().build());

        String url = adapter.upload("report.pdf", new byte[]{1, 2, 3}, "application/pdf");

        assertThat(url).startsWith("https://test-bucket.s3.us-east-1.amazonaws.com/");
        assertThat(url).endsWith("_report.pdf");
        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void upload_usesBucketAndKeyInPutObjectRequest() {
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenReturn(PutObjectResponse.builder().build());

        adapter.upload("file.txt", new byte[10], "text/plain");

        verify(s3Client).putObject(
                argThat((PutObjectRequest req) ->
                        req.bucket().equals("test-bucket") &&
                        req.key().endsWith("_file.txt") &&
                        req.contentType().equals("text/plain") &&
                        req.contentLength() == 10L),
                any(RequestBody.class));
    }

    @Test
    void upload_whenS3Fails_propagatesException() {
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenThrow(new RuntimeException("S3 unavailable"));

        assertThatThrownBy(() -> adapter.upload("f.pdf", new byte[1], "application/pdf"))
                .hasMessage("S3 unavailable");
    }

    @Test
    void delete_sendsDeleteRequestWithCorrectBucketAndKey() {
        when(s3Client.deleteObject(any(DeleteObjectRequest.class)))
                .thenReturn(DeleteObjectResponse.builder().build());

        adapter.delete("uuid_report.pdf");

        verify(s3Client).deleteObject(
                argThat((DeleteObjectRequest req) ->
                        req.bucket().equals("test-bucket") &&
                        req.key().equals("uuid_report.pdf")));
    }

    @Test
    void delete_whenS3Fails_propagatesException() {
        when(s3Client.deleteObject(any(DeleteObjectRequest.class)))
                .thenThrow(new RuntimeException("S3 unavailable"));

        assertThatThrownBy(() -> adapter.delete("uuid_report.pdf"))
                .hasMessage("S3 unavailable");
    }

    @Test
    void download_returnsObjectBytes() {
        byte[] expected = new byte[]{1, 2, 3};
        when(s3Client.getObjectAsBytes(any(GetObjectRequest.class)))
                .thenReturn(ResponseBytes.fromByteArray(GetObjectResponse.builder().build(), expected));

        assertThat(adapter.download("uuid_report.pdf")).isEqualTo(expected);
        verify(s3Client).getObjectAsBytes(
                argThat((GetObjectRequest req) ->
                        req.bucket().equals("test-bucket") &&
                        req.key().equals("uuid_report.pdf")));
    }

    @Test
    void download_whenS3Fails_propagatesException() {
        when(s3Client.getObjectAsBytes(any(GetObjectRequest.class)))
                .thenThrow(new RuntimeException("S3 unavailable"));

        assertThatThrownBy(() -> adapter.download("uuid_report.pdf"))
                .hasMessage("S3 unavailable");
    }
}
