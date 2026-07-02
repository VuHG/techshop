package com.techshop.module.dexuat.service;

import com.techshop.module.dexuat.entity.DeXuatGia;
import com.techshop.module.dexuat.repository.DeXuatGiaRepository;
import com.techshop.module.flashsale.service.FlashSaleQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Engine SINH đề xuất giá (rule-based) — KHÔNG tự áp, chỉ tạo đề xuất chờ admin duyệt.
 * Tín hiệu: tồn kho, lượt bán, giá thị trường (mock). Có guardrail sàn + bỏ qua biến thể
 * đang flash sale + không tạo trùng khi đã có đề xuất CHO_DUYET.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DeXuatGiaGenerator {

    private static final int TON_CAO = 40;       // tồn từ mức này coi là "tồn cao"
    private static final int BAN_CHAM = 10;      // bán dưới mức này coi là "bán chậm"
    private static final double SAN = 0.80;      // giá đề xuất không dưới 80% giá gốc
    private static final int SO_NGAY_HET_HAN = 3;
    private static final int GIOI_HAN_MOI_LAN = 20;

    private final DeXuatGiaRepository deXuatGiaRepo;
    private final FlashSaleQueryService flashSaleQueryService;

    /** Chạy sau khởi động 45s, lặp mỗi 6 giờ. Trả số đề xuất mới sinh. */
    @Scheduled(initialDelay = 45_000, fixedDelay = 21_600_000)
    @Transactional
    public int sinh() {
        List<Object[]> rows = deXuatGiaRepo.layThongKeBienThe();
        if (rows.isEmpty()) return 0;

        // Bỏ qua biến thể đang flash sale (1 truy vấn batch).
        List<Long> ids = new ArrayList<>();
        for (Object[] r : rows) ids.add(((Number) r[0]).longValue());
        Map<Long, BigDecimal> flash = flashSaleQueryService.giaFlashSaleConHieuLuc(ids);

        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime hetHan = now.plusDays(SO_NGAY_HET_HAN);
        int demSinh = 0;

        for (Object[] r : rows) {
            if (demSinh >= GIOI_HAN_MOI_LAN) break;

            Long bienTheId = ((Number) r[0]).longValue();
            String tenSanPham = (String) r[1];
            String mauSac = (String) r[2];
            BigDecimal gia = (BigDecimal) r[3];
            BigDecimal giaKhuyenMai = (BigDecimal) r[4];
            int ton = r[5] == null ? 0 : ((Number) r[5]).intValue();
            int ban = r[6] == null ? 0 : ((Number) r[6]).intValue();
            BigDecimal giaTT = (BigDecimal) r[7];

            if (gia == null || gia.signum() <= 0) continue;
            if (flash.containsKey(bienTheId)) continue;
            if (deXuatGiaRepo.existsByBienTheIdAndTrangThai(bienTheId, DeXuatGia.CHO_DUYET)) continue;

            BigDecimal giaBanHienTai = giaKhuyenMai != null ? giaKhuyenMai : gia;
            boolean tonCao = ton >= TON_CAO;
            boolean banCham = ban <= BAN_CHAM;
            boolean reHonThiTruong = giaTT != null && giaTT.compareTo(giaBanHienTai) < 0;
            if (!tonCao && !banCham && !reHonThiTruong) continue;   // không có lý do để giảm

            // % giảm theo tín hiệu (tối đa 20%).
            double pct = 0.05 + (tonCao ? 0.08 : 0) + (banCham ? 0.07 : 0);
            BigDecimal target = gia.multiply(BigDecimal.valueOf(1 - pct));
            if (giaTT != null) {
                BigDecimal undercut = giaTT.multiply(BigDecimal.valueOf(0.98));   // hạ nhẹ dưới đối thủ
                if (undercut.compareTo(target) < 0) target = undercut;
            }
            BigDecimal san = gia.multiply(BigDecimal.valueOf(SAN));
            if (target.compareTo(san) < 0) target = san;

            BigDecimal giaDeXuat = lamTronNghin(target);
            // Chỉ đề xuất nếu thực sự GIẢM so với giá đang bán (≥ ~1%) và dưới giá gốc.
            if (giaDeXuat.signum() <= 0 || giaDeXuat.compareTo(gia) >= 0) continue;
            if (giaDeXuat.compareTo(giaBanHienTai.multiply(BigDecimal.valueOf(0.99))) > 0) continue;

            deXuatGiaRepo.save(DeXuatGia.builder()
                    .bienTheId(bienTheId)
                    .giaCu(giaBanHienTai)
                    .giaDeXuat(giaDeXuat)
                    .lyDo(taoLyDo(tenSanPham, mauSac, gia, giaBanHienTai, giaDeXuat, ton, ban, giaTT, tonCao, banCham, reHonThiTruong))
                    .trangThai(DeXuatGia.CHO_DUYET)
                    .ngayTao(now)
                    .ngayHetHan(hetHan)
                    .build());
            demSinh++;
        }

        if (demSinh > 0) log.info("[de-xuat-gia] Sinh {} đề xuất giá mới", demSinh);
        return demSinh;
    }

    private BigDecimal lamTronNghin(BigDecimal v) {
        return v.divide(BigDecimal.valueOf(1000), 0, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(1000));
    }

    private String taoLyDo(String ten, String mau, BigDecimal gia, BigDecimal giaBan, BigDecimal giaDeXuat,
                           int ton, int ban, BigDecimal giaTT, boolean tonCao, boolean banCham, boolean reHon) {
        List<String> tin = new ArrayList<>();
        if (tonCao) tin.add("tồn kho cao (" + ton + ")");
        if (banCham) tin.add("bán chậm (đã bán " + ban + ")");
        if (reHon) tin.add("giá đối thủ " + dinhDang(giaTT) + " thấp hơn giá đang bán");
        String tenBt = ten + (mau != null && !mau.isBlank() ? " - " + mau : "");
        return "Biến thể \"" + tenBt + "\": " + String.join(", ", tin)
                + ". Giá gốc " + dinhDang(gia) + ", đang bán " + dinhDang(giaBan)
                + " → đề xuất giảm còn " + dinhDang(giaDeXuat) + " để kích cầu.";
    }

    private String dinhDang(BigDecimal v) {
        if (v == null) return "-";
        return String.format("%,dđ", v.setScale(0, RoundingMode.HALF_UP).longValueExact());
    }
}
