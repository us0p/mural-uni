package com.college.api.infrastructure.persistence.uiitem;

import com.college.api.domain.uiitem.UiItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaUiItemRepository extends JpaRepository<UiItem, String> {
}
