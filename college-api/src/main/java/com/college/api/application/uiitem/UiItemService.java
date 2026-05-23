package com.college.api.application.uiitem;

import com.college.api.application.exception.ResourceNotFoundException;
import com.college.api.domain.uiitem.UiItem;
import com.college.api.domain.uiitem.UiItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UiItemService {

    private final UiItemRepository repository;

    @Transactional(readOnly = true)
    public List<UiItem> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public UiItem findById(String name) {
        return repository.findById(name)
                .orElseThrow(() -> new ResourceNotFoundException("UiItem", name));
    }

    @Transactional
    public UiItem create(String name) {
        return repository.save(new UiItem(name));
    }

    @Transactional
    public void delete(String name) {
        if (!repository.existsById(name)) {
            throw new ResourceNotFoundException("UiItem", name);
        }
        repository.deleteById(name);
    }
}
