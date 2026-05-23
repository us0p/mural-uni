package com.college.api.domain.notice;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notice_category")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class NoticeCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 20, unique = true, nullable = false)
    private String name;
}
