package com.college.api.infrastructure.storage;

import com.college.api.domain.document.DocumentStoragePort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.util.UUID;

@Component
public class S3DocumentStorageAdapter implements DocumentStoragePort {

    private final S3Client s3Client;
    private final String bucket;
    private final String region;

    public S3DocumentStorageAdapter(
            S3Client s3Client,
            @Value("${aws.s3.bucket-name}") String bucket,
            @Value("${aws.s3.region}") String region) {
        this.s3Client = s3Client;
        this.bucket = bucket;
        this.region = region;
    }

    @Override
    public String upload(String fileName, byte[] content, String contentType) {
        String key = UUID.randomUUID() + "_" + fileName;
        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType(contentType)
                        .contentLength((long) content.length)
                        .build(),
                RequestBody.fromBytes(content));
        return "https://%s.s3.%s.amazonaws.com/%s".formatted(bucket, region, key);
    }

    @Override
    public void delete(String key) {
        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build());
    }

    @Override
    public byte[] download(String key) {
        return s3Client.getObjectAsBytes(GetObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build()).asByteArray();
    }
}
