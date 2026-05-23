package com.college.api.domain.uiitem;

import java.util.List;
import java.util.Optional;

public interface UiItemRepository {
    UiItem save(UiItem uiItem);
    Optional<UiItem> findById(String name);
    List<UiItem> findAll();
    void deleteById(String name);
    boolean existsById(String name);
}
