package com.techshop.shared.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Xóa các cache HIỂN THỊ (catalog) mỗi khi backend khởi động.
 *
 * Lý do: Redis chạy ở container riêng, KHÔNG bị xóa khi ta drop/tạo lại DB.
 * Các cache catalog có TTL 24h và không tự evict → sau khi tạo lại DB, danh sách
 * phân loại / cây danh mục / filter cũ vẫn nằm trong Redis và có thể trỏ tới id
 * không còn khớp → trang khách hàng hiển thị sai (vd phân loại ra 0 sản phẩm).
 *
 * Chỉ xóa đúng 4 vùng cache @Cacheable bên dưới qua CacheManager. KHÔNG dùng
 * FLUSHALL → KHÔNG đụng tới refresh token / dữ liệu Redis khác (đăng nhập an toàn).
 * Cache tự dựng lại ở request đầu tiên sau khi khởi động.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CacheResetOnStartup {

    private static final List<String> CATALOG_CACHES =
            List.of("danh-muc-cay", "phan-loai", "filter-schema", "san-pham-chi-tiet");

    private final CacheManager cacheManager;

    @EventListener(ApplicationReadyEvent.class)
    public void xoaCacheCatalogKhiKhoiDong() {
        CATALOG_CACHES.forEach(ten -> {
            Cache cache = cacheManager.getCache(ten);
            if (cache != null) {
                cache.clear();
            }
        });
        log.info("Đã xóa cache catalog khi khởi động (đồng bộ với DB hiện tại): {}", CATALOG_CACHES);
    }
}
