package com.college.api.application.notice;

import com.college.api.application.exception.ResourceNotFoundException;
import com.college.api.domain.notice.NoticeCategory;
import com.college.api.domain.notice.NoticeCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeCategoryService {

    private final NoticeCategoryRepository repository;

    @Transactional(readOnly = true)
    public List<NoticeCategory> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public NoticeCategory findById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NoticeCategory", id));
    }

    @Transactional
    public NoticeCategory create(String name) {
        return repository.save(NoticeCategory.builder().name(name).build());
    }

    @Transactional
    public NoticeCategory update(Integer id, String name) {
        NoticeCategory category = findById(id);
        category.setName(name);
        return repository.save(category);
    }

    @Transactional
    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("NoticeCategory", id);
        }
        repository.deleteById(id);
    }
}
