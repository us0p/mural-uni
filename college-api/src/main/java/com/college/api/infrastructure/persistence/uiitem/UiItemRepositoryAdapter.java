package com.college.api.infrastructure.persistence.uiitem;

import com.college.api.domain.uiitem.UiItem;
import com.college.api.domain.uiitem.UiItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UiItemRepositoryAdapter implements UiItemRepository {

    private final JpaUiItemRepository jpa;

    @Override
    public UiItem save(UiItem uiItem) {
        return jpa.save(uiItem);
    }

    @Override
    public Optional<UiItem> findById(String name) {
        return jpa.findById(name);
    }

    @Override
    public List<UiItem> findAll() {
        return jpa.findAll();
    }

    @Override
    public void deleteById(String name) {
        jpa.deleteById(name);
    }

    @Override
    public boolean existsById(String name) {
        return jpa.existsById(name);
    }
}
