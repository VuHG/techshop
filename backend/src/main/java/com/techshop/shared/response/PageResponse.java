package com.techshop.shared.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PageResponse<T> {
    private List<T> items;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private boolean hasNext;

    public static <T> PageResponse<T> of(List<T> items, long totalElements, int totalPages,
                                          int currentPage) {
        return PageResponse.<T>builder()
                .items(items)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .currentPage(currentPage)
                .hasNext(currentPage < totalPages - 1)
                .build();
    }
}
