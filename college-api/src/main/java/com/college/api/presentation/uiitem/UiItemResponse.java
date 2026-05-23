package com.college.api.presentation.uiitem;

import com.college.api.domain.uiitem.UiItem;

public record UiItemResponse(String name) {

    public static UiItemResponse from(UiItem uiItem) {
        return new UiItemResponse(uiItem.getName());
    }
}
