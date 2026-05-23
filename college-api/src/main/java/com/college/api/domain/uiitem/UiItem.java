package com.college.api.domain.uiitem;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ui_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "name")
public class UiItem {

    @Id
    @Column(length = 20)
    private String name;
}
