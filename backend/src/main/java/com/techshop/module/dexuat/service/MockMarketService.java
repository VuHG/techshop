package com.techshop.module.dexuat.service;

import com.techshop.module.dexuat.repository.GiaThiTruongRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Dữ liệu thị trường giả lập (mock market): định kỳ bổ sung giá cho biến thể mới +
 * jitter nhẹ để mô phỏng biến động, làm tín hiệu đầu vào cho đề xuất giá.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MockMarketService {

    private final GiaThiTruongRepository giaThiTruongRepo;

    /** Chạy sau khởi động 30s, lặp mỗi 1 giờ. */
    @Scheduled(initialDelay = 30_000, fixedDelay = 3_600_000)
    @Transactional
    public void capNhatMockMarket() {
        int them = giaThiTruongRepo.themChoBienTheMoi();
        int doi = giaThiTruongRepo.moPhongBienDong();
        if (them > 0) log.info("[mock-market] Thêm giá thị trường cho {} biến thể mới", them);
        log.debug("[mock-market] Mô phỏng biến động {} dòng giá thị trường", doi);
    }
}
