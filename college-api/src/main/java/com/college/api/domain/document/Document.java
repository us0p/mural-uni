package com.college.api.domain.document;

import com.college.api.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "file_name", length = 100, unique = true, nullable = false)
    private String fileName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "file_size", nullable = false)
    private Integer fileSize;

    @Column(name = "bucket_url", length = 255, unique = true, nullable = false)
    private String bucketUrl;

    @Column(name = "knowledge_base", nullable = false)
    private boolean knowledgeBase;

    @Column(name = "is_public", nullable = false)
    private boolean isPublic;
}
