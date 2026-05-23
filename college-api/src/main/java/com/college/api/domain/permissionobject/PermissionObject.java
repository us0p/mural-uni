package com.college.api.domain.permissionobject;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "permission_objects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class PermissionObject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 20, unique = true, nullable = false)
    private String name;
}
