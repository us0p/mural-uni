package com.college.api.domain.uiitem;

import com.college.api.domain.permissionobject.PermissionObject;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "ui_permission_objects",
    uniqueConstraints = @UniqueConstraint(columnNames = {"ui_item_name", "permission_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class UiPermissionObject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ui_item_name", nullable = false)
    private UiItem uiItem;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "permission_id", nullable = false)
    private PermissionObject permission;
}
