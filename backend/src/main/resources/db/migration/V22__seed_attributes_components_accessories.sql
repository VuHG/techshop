-- ============================================================
-- V22: Seed thuộc tính + giá trị cho các phân loại Linh kiện & Phụ kiện.
--   Phân loại định danh theo slug (duy nhất, đặt ở V11) để tránh nhầm tên trùng.
--   Sau khi seed → dựng lại thong_so_loc (filter schema) cho từng phân loại,
--   khớp đúng logic ChiTietThuocTinhLocRepository.rebuildThongSoLoc.
-- ============================================================

-- ── 1) Thuộc tính (mỗi dòng: slug phân loại, tên, mã, thứ tự) ──────────────
INSERT INTO thuoc_tinh (ten_thuoc_tinh, phan_loai_id, ma_thuoc_tinh, kieu_du_lieu, thu_tu_hien_thi, trang_thai_duyet, trang_thai)
SELECT v.ten, pl.id, v.ma, 'STRING', v.thu_tu, 'APPROVED', 'ACTIVE'
FROM phan_loai_san_pham pl
JOIN (VALUES
    -- Màn hình rời
    ('pl-man-hinh-roi', 'Kiểu màn hình',        'kieu_man_hinh',        1),
    ('pl-man-hinh-roi', 'Kích thước màn hình',  'kich_thuoc_man_hinh',  2),
    ('pl-man-hinh-roi', 'Độ phân giải',         'do_phan_giai',         3),
    ('pl-man-hinh-roi', 'Tần số quét',          'tan_so_quet',          4),
    ('pl-man-hinh-roi', 'Tấm nền (Panel)',      'tam_nen',              5),
    ('pl-man-hinh-roi', 'Thời gian phản hồi',   'thoi_gian_phan_hoi',   6),
    -- Ram
    ('pl-ram', 'Thế hệ RAM',                    'the_he_ram',           1),
    ('pl-ram', 'Dung lượng',                    'dung_luong',           2),
    ('pl-ram', 'Tốc độ Bus',                    'toc_do_bus',           3),
    ('pl-ram', 'Loại RAM (Laptop/PC)',          'loai_ram',             4),
    -- Sạc pin laptop
    ('pl-sac-pin-laptop', 'Loại chân cắm',      'loai_chan_cam',        1),
    ('pl-sac-pin-laptop', 'Công suất',          'cong_suat',            2),
    -- Ổ cứng SSD
    ('pl-o-cung-ssd', 'Chuẩn cắm',              'chuan_cam',            1),
    ('pl-o-cung-ssd', 'Giao thức truyền tải',   'giao_thuc_truyen_tai', 2),
    ('pl-o-cung-ssd', 'Băng thông',             'bang_thong',           3),
    ('pl-o-cung-ssd', 'Dung lượng',             'dung_luong',           4),
    -- Bàn phím
    ('pl-ban-phim', 'Kiểu kết nối',             'kieu_ket_noi',         1),
    ('pl-ban-phim', 'Loại switch',              'loai_switch',          2),
    ('pl-ban-phim', 'Layout',                   'layout',               3),
    ('pl-ban-phim', 'Đèn nền',                  'den_nen',              4),
    -- Bộ thu phát Wifi/Bluetooth
    ('pl-bo-thu-phat-wifi-bluetooth', 'Chuẩn kết nối', 'chuan_ket_noi', 1),
    ('pl-bo-thu-phat-wifi-bluetooth', 'Chuẩn Wifi',    'chuan_wifi',    2),
    ('pl-bo-thu-phat-wifi-bluetooth', 'Băng tần',      'bang_tan',      3),
    ('pl-bo-thu-phat-wifi-bluetooth', 'Cổng kết nối',  'cong_ket_noi',  4),
    -- Chuột
    ('pl-chuot', 'Kiểu kết nối',                'kieu_ket_noi',         1),
    ('pl-chuot', 'Độ phân giải (DPI)',          'dpi',                  2),
    ('pl-chuot', 'Số nút',                      'so_nut',               3),
    ('pl-chuot', 'Cảm biến',                    'cam_bien',             4),
    -- Hub USB
    ('pl-hub-usb', 'Cổng kết nối',              'cong_ket_noi',         1),
    ('pl-hub-usb', 'Số cổng',                   'so_cong',              2),
    ('pl-hub-usb', 'Chuẩn USB',                 'chuan_usb',            3),
    ('pl-hub-usb', 'Cổng mở rộng',              'cong_mo_rong',         4),
    -- Loa
    ('pl-loa', 'Kiểu kết nối',                  'kieu_ket_noi',         1),
    ('pl-loa', 'Kiểu loa',                      'kieu_loa',             2),
    ('pl-loa', 'Công suất',                     'cong_suat',            3),
    ('pl-loa', 'Tính năng',                     'tinh_nang',            4),
    -- Lót chuột
    ('pl-lot-chuot', 'Kích thước',              'kich_thuoc',           1),
    ('pl-lot-chuot', 'Chất liệu bề mặt',        'chat_lieu_be_mat',     2),
    ('pl-lot-chuot', 'Độ dày',                  'do_day',               3),
    ('pl-lot-chuot', 'Đèn LED',                 'den_led',              4),
    -- Tai nghe
    ('pl-tai-nghe', 'Kiểu kết nối',             'kieu_ket_noi',         1),
    ('pl-tai-nghe', 'Kiểu dáng',                'kieu_dang',            2),
    ('pl-tai-nghe', 'Tính năng',                'tinh_nang',            3),
    ('pl-tai-nghe', 'Driver',                   'driver',               4),
    -- USB Flash Drive
    ('pl-usb-flash-drive', 'Dung lượng',        'dung_luong',           1),
    ('pl-usb-flash-drive', 'Chuẩn kết nối',     'chuan_ket_noi',        2),
    ('pl-usb-flash-drive', 'Tốc độ đọc',        'toc_do_doc',           3),
    ('pl-usb-flash-drive', 'Chất liệu vỏ',      'chat_lieu_vo',         4),
    -- Webcam rời
    ('pl-webcam-roi', 'Độ phân giải',           'do_phan_giai',         1),
    ('pl-webcam-roi', 'Tần số khung hình',      'tan_so_khung_hinh',    2),
    ('pl-webcam-roi', 'Góc nhìn',               'goc_nhin',             3),
    ('pl-webcam-roi', 'Tính năng',              'tinh_nang',            4)
) AS v(slug, ten, ma, thu_tu) ON pl.slug = v.slug;

-- ── 2) Giá trị thuộc tính (mỗi dòng: slug, mã thuộc tính, giá trị, thứ tự) ──
INSERT INTO gia_tri_thuoc_tinh (thuoc_tinh_id, gia_tri, thu_tu_hien_thi, trang_thai_duyet, trang_thai)
SELECT tt.id, v.gia_tri, v.thu_tu, 'APPROVED', 'ACTIVE'
FROM thuoc_tinh tt
JOIN phan_loai_san_pham pl ON tt.phan_loai_id = pl.id
JOIN (VALUES
    -- ===== Màn hình rời =====
    ('pl-man-hinh-roi', 'kieu_man_hinh', 'Phẳng', 1),
    ('pl-man-hinh-roi', 'kieu_man_hinh', 'Cong', 2),
    ('pl-man-hinh-roi', 'kich_thuoc_man_hinh', '22 inch', 1),
    ('pl-man-hinh-roi', 'kich_thuoc_man_hinh', '24 inch', 2),
    ('pl-man-hinh-roi', 'kich_thuoc_man_hinh', '27 inch', 3),
    ('pl-man-hinh-roi', 'kich_thuoc_man_hinh', '32 inch', 4),
    ('pl-man-hinh-roi', 'kich_thuoc_man_hinh', '34 inch', 5),
    ('pl-man-hinh-roi', 'do_phan_giai', 'Full HD (1920x1080)', 1),
    ('pl-man-hinh-roi', 'do_phan_giai', '2K (2560x1440)', 2),
    ('pl-man-hinh-roi', 'do_phan_giai', '4K (3840x2160)', 3),
    ('pl-man-hinh-roi', 'do_phan_giai', 'Ultrawide (3440x1440)', 4),
    ('pl-man-hinh-roi', 'tan_so_quet', '60Hz', 1),
    ('pl-man-hinh-roi', 'tan_so_quet', '75Hz', 2),
    ('pl-man-hinh-roi', 'tan_so_quet', '100Hz', 3),
    ('pl-man-hinh-roi', 'tan_so_quet', '144Hz', 4),
    ('pl-man-hinh-roi', 'tan_so_quet', '165Hz', 5),
    ('pl-man-hinh-roi', 'tan_so_quet', '240Hz', 6),
    ('pl-man-hinh-roi', 'tam_nen', 'IPS', 1),
    ('pl-man-hinh-roi', 'tam_nen', 'VA', 2),
    ('pl-man-hinh-roi', 'tam_nen', 'TN', 3),
    ('pl-man-hinh-roi', 'tam_nen', 'OLED', 4),
    ('pl-man-hinh-roi', 'thoi_gian_phan_hoi', '1ms', 1),
    ('pl-man-hinh-roi', 'thoi_gian_phan_hoi', '2ms', 2),
    ('pl-man-hinh-roi', 'thoi_gian_phan_hoi', '4ms', 3),
    ('pl-man-hinh-roi', 'thoi_gian_phan_hoi', '5ms', 4),
    -- ===== Ram =====
    ('pl-ram', 'the_he_ram', 'DDR3', 1),
    ('pl-ram', 'the_he_ram', 'DDR4', 2),
    ('pl-ram', 'the_he_ram', 'DDR5', 3),
    ('pl-ram', 'dung_luong', '4GB', 1),
    ('pl-ram', 'dung_luong', '8GB', 2),
    ('pl-ram', 'dung_luong', '16GB', 3),
    ('pl-ram', 'dung_luong', '32GB', 4),
    ('pl-ram', 'dung_luong', '64GB', 5),
    ('pl-ram', 'toc_do_bus', '1600MHz', 1),
    ('pl-ram', 'toc_do_bus', '2666MHz', 2),
    ('pl-ram', 'toc_do_bus', '3200MHz', 3),
    ('pl-ram', 'toc_do_bus', '3600MHz', 4),
    ('pl-ram', 'toc_do_bus', '5200MHz', 5),
    ('pl-ram', 'toc_do_bus', '6000MHz', 6),
    ('pl-ram', 'loai_ram', 'Laptop (SO-DIMM)', 1),
    ('pl-ram', 'loai_ram', 'PC (U-DIMM)', 2),
    -- ===== Sạc pin laptop =====
    ('pl-sac-pin-laptop', 'loai_chan_cam', 'USB-C', 1),
    ('pl-sac-pin-laptop', 'loai_chan_cam', 'DC tròn', 2),
    ('pl-sac-pin-laptop', 'loai_chan_cam', 'DC vuông', 3),
    ('pl-sac-pin-laptop', 'loai_chan_cam', 'MagSafe', 4),
    ('pl-sac-pin-laptop', 'cong_suat', '45W', 1),
    ('pl-sac-pin-laptop', 'cong_suat', '65W', 2),
    ('pl-sac-pin-laptop', 'cong_suat', '90W', 3),
    ('pl-sac-pin-laptop', 'cong_suat', '120W', 4),
    ('pl-sac-pin-laptop', 'cong_suat', '140W', 5),
    ('pl-sac-pin-laptop', 'cong_suat', '240W', 6),
    -- ===== Ổ cứng SSD =====
    ('pl-o-cung-ssd', 'chuan_cam', 'SATA III 2.5"', 1),
    ('pl-o-cung-ssd', 'chuan_cam', 'M.2 2280', 2),
    ('pl-o-cung-ssd', 'chuan_cam', 'M.2 2242', 3),
    ('pl-o-cung-ssd', 'chuan_cam', 'mSATA', 4),
    ('pl-o-cung-ssd', 'giao_thuc_truyen_tai', 'SATA', 1),
    ('pl-o-cung-ssd', 'giao_thuc_truyen_tai', 'NVMe PCIe 3.0', 2),
    ('pl-o-cung-ssd', 'giao_thuc_truyen_tai', 'NVMe PCIe 4.0', 3),
    ('pl-o-cung-ssd', 'giao_thuc_truyen_tai', 'NVMe PCIe 5.0', 4),
    ('pl-o-cung-ssd', 'bang_thong', '550 MB/s', 1),
    ('pl-o-cung-ssd', 'bang_thong', '2000 MB/s', 2),
    ('pl-o-cung-ssd', 'bang_thong', '3500 MB/s', 3),
    ('pl-o-cung-ssd', 'bang_thong', '7000 MB/s', 4),
    ('pl-o-cung-ssd', 'bang_thong', '12000 MB/s', 5),
    ('pl-o-cung-ssd', 'dung_luong', '256GB', 1),
    ('pl-o-cung-ssd', 'dung_luong', '512GB', 2),
    ('pl-o-cung-ssd', 'dung_luong', '1TB', 3),
    ('pl-o-cung-ssd', 'dung_luong', '2TB', 4),
    ('pl-o-cung-ssd', 'dung_luong', '4TB', 5),
    -- ===== Bàn phím =====
    ('pl-ban-phim', 'kieu_ket_noi', 'Có dây', 1),
    ('pl-ban-phim', 'kieu_ket_noi', 'Không dây (2.4GHz)', 2),
    ('pl-ban-phim', 'kieu_ket_noi', 'Bluetooth', 3),
    ('pl-ban-phim', 'loai_switch', 'Blue (Clicky)', 1),
    ('pl-ban-phim', 'loai_switch', 'Red (Linear)', 2),
    ('pl-ban-phim', 'loai_switch', 'Brown (Tactile)', 3),
    ('pl-ban-phim', 'loai_switch', 'Quang học (Optical)', 4),
    ('pl-ban-phim', 'layout', 'Fullsize (104 phím)', 1),
    ('pl-ban-phim', 'layout', 'TKL (87 phím)', 2),
    ('pl-ban-phim', 'layout', '75%', 3),
    ('pl-ban-phim', 'layout', '60%', 4),
    ('pl-ban-phim', 'den_nen', 'Không', 1),
    ('pl-ban-phim', 'den_nen', 'Đơn sắc', 2),
    ('pl-ban-phim', 'den_nen', 'RGB', 3),
    -- ===== Bộ thu phát Wifi/Bluetooth =====
    ('pl-bo-thu-phat-wifi-bluetooth', 'chuan_ket_noi', 'Wifi', 1),
    ('pl-bo-thu-phat-wifi-bluetooth', 'chuan_ket_noi', 'Bluetooth', 2),
    ('pl-bo-thu-phat-wifi-bluetooth', 'chuan_ket_noi', 'Wifi + Bluetooth', 3),
    ('pl-bo-thu-phat-wifi-bluetooth', 'chuan_wifi', 'Wifi 4 (N)', 1),
    ('pl-bo-thu-phat-wifi-bluetooth', 'chuan_wifi', 'Wifi 5 (AC)', 2),
    ('pl-bo-thu-phat-wifi-bluetooth', 'chuan_wifi', 'Wifi 6 (AX)', 3),
    ('pl-bo-thu-phat-wifi-bluetooth', 'chuan_wifi', 'Wifi 6E', 4),
    ('pl-bo-thu-phat-wifi-bluetooth', 'bang_tan', '2.4GHz', 1),
    ('pl-bo-thu-phat-wifi-bluetooth', 'bang_tan', '5GHz', 2),
    ('pl-bo-thu-phat-wifi-bluetooth', 'bang_tan', 'Dual-band', 3),
    ('pl-bo-thu-phat-wifi-bluetooth', 'cong_ket_noi', 'USB-A', 1),
    ('pl-bo-thu-phat-wifi-bluetooth', 'cong_ket_noi', 'USB-C', 2),
    ('pl-bo-thu-phat-wifi-bluetooth', 'cong_ket_noi', 'PCIe', 3),
    -- ===== Chuột =====
    ('pl-chuot', 'kieu_ket_noi', 'Có dây', 1),
    ('pl-chuot', 'kieu_ket_noi', 'Không dây (2.4GHz)', 2),
    ('pl-chuot', 'kieu_ket_noi', 'Bluetooth', 3),
    ('pl-chuot', 'dpi', '1600 DPI', 1),
    ('pl-chuot', 'dpi', '4000 DPI', 2),
    ('pl-chuot', 'dpi', '8000 DPI', 3),
    ('pl-chuot', 'dpi', '16000 DPI', 4),
    ('pl-chuot', 'dpi', '26000 DPI', 5),
    ('pl-chuot', 'so_nut', '2 nút', 1),
    ('pl-chuot', 'so_nut', '3 nút', 2),
    ('pl-chuot', 'so_nut', '6 nút', 3),
    ('pl-chuot', 'so_nut', '8+ nút', 4),
    ('pl-chuot', 'cam_bien', 'Quang học (Optical)', 1),
    ('pl-chuot', 'cam_bien', 'Laser', 2),
    -- ===== Hub USB =====
    ('pl-hub-usb', 'cong_ket_noi', 'USB-A', 1),
    ('pl-hub-usb', 'cong_ket_noi', 'USB-C', 2),
    ('pl-hub-usb', 'so_cong', '3 cổng', 1),
    ('pl-hub-usb', 'so_cong', '4 cổng', 2),
    ('pl-hub-usb', 'so_cong', '7 cổng', 3),
    ('pl-hub-usb', 'so_cong', '10+ cổng', 4),
    ('pl-hub-usb', 'chuan_usb', 'USB 2.0', 1),
    ('pl-hub-usb', 'chuan_usb', 'USB 3.0', 2),
    ('pl-hub-usb', 'chuan_usb', 'USB 3.1', 3),
    ('pl-hub-usb', 'chuan_usb', 'USB 3.2', 4),
    ('pl-hub-usb', 'cong_mo_rong', 'HDMI', 1),
    ('pl-hub-usb', 'cong_mo_rong', 'LAN (RJ45)', 2),
    ('pl-hub-usb', 'cong_mo_rong', 'Đọc thẻ SD', 3),
    ('pl-hub-usb', 'cong_mo_rong', 'Sạc PD', 4),
    -- ===== Loa =====
    ('pl-loa', 'kieu_ket_noi', 'Có dây (3.5mm)', 1),
    ('pl-loa', 'kieu_ket_noi', 'Bluetooth', 2),
    ('pl-loa', 'kieu_ket_noi', 'USB', 3),
    ('pl-loa', 'kieu_loa', 'Loa 2.0', 1),
    ('pl-loa', 'kieu_loa', 'Loa 2.1', 2),
    ('pl-loa', 'kieu_loa', 'Soundbar', 3),
    ('pl-loa', 'kieu_loa', 'Loa di động', 4),
    ('pl-loa', 'cong_suat', '6W', 1),
    ('pl-loa', 'cong_suat', '10W', 2),
    ('pl-loa', 'cong_suat', '20W', 3),
    ('pl-loa', 'cong_suat', '40W', 4),
    ('pl-loa', 'cong_suat', '60W+', 5),
    ('pl-loa', 'tinh_nang', 'Chống nước', 1),
    ('pl-loa', 'tinh_nang', 'Đèn RGB', 2),
    ('pl-loa', 'tinh_nang', 'Tích hợp mic', 3),
    ('pl-loa', 'tinh_nang', 'Pin sạc', 4),
    -- ===== Lót chuột =====
    ('pl-lot-chuot', 'kich_thuoc', 'Nhỏ (S)', 1),
    ('pl-lot-chuot', 'kich_thuoc', 'Vừa (M)', 2),
    ('pl-lot-chuot', 'kich_thuoc', 'Lớn (L)', 3),
    ('pl-lot-chuot', 'kich_thuoc', 'Extended (XL)', 4),
    ('pl-lot-chuot', 'chat_lieu_be_mat', 'Vải', 1),
    ('pl-lot-chuot', 'chat_lieu_be_mat', 'Cao su', 2),
    ('pl-lot-chuot', 'chat_lieu_be_mat', 'Nhựa cứng', 3),
    ('pl-lot-chuot', 'chat_lieu_be_mat', 'Kính cường lực', 4),
    ('pl-lot-chuot', 'do_day', '2mm', 1),
    ('pl-lot-chuot', 'do_day', '3mm', 2),
    ('pl-lot-chuot', 'do_day', '4mm', 3),
    ('pl-lot-chuot', 'do_day', '5mm', 4),
    ('pl-lot-chuot', 'den_led', 'Không', 1),
    ('pl-lot-chuot', 'den_led', 'RGB viền', 2),
    -- ===== Tai nghe =====
    ('pl-tai-nghe', 'kieu_ket_noi', 'Có dây (3.5mm)', 1),
    ('pl-tai-nghe', 'kieu_ket_noi', 'Có dây (USB)', 2),
    ('pl-tai-nghe', 'kieu_ket_noi', 'Bluetooth', 3),
    ('pl-tai-nghe', 'kieu_ket_noi', 'Không dây (2.4GHz)', 4),
    ('pl-tai-nghe', 'kieu_dang', 'In-ear', 1),
    ('pl-tai-nghe', 'kieu_dang', 'On-ear', 2),
    ('pl-tai-nghe', 'kieu_dang', 'Over-ear', 3),
    ('pl-tai-nghe', 'kieu_dang', 'True Wireless (TWS)', 4),
    ('pl-tai-nghe', 'tinh_nang', 'Chống ồn chủ động (ANC)', 1),
    ('pl-tai-nghe', 'tinh_nang', 'Có mic', 2),
    ('pl-tai-nghe', 'tinh_nang', 'Chống nước', 3),
    ('pl-tai-nghe', 'tinh_nang', 'Đèn RGB', 4),
    ('pl-tai-nghe', 'driver', '10mm', 1),
    ('pl-tai-nghe', 'driver', '40mm', 2),
    ('pl-tai-nghe', 'driver', '50mm', 3),
    -- ===== USB Flash Drive =====
    ('pl-usb-flash-drive', 'dung_luong', '16GB', 1),
    ('pl-usb-flash-drive', 'dung_luong', '32GB', 2),
    ('pl-usb-flash-drive', 'dung_luong', '64GB', 3),
    ('pl-usb-flash-drive', 'dung_luong', '128GB', 4),
    ('pl-usb-flash-drive', 'dung_luong', '256GB', 5),
    ('pl-usb-flash-drive', 'dung_luong', '512GB', 6),
    ('pl-usb-flash-drive', 'chuan_ket_noi', 'USB 2.0', 1),
    ('pl-usb-flash-drive', 'chuan_ket_noi', 'USB 3.0', 2),
    ('pl-usb-flash-drive', 'chuan_ket_noi', 'USB 3.1', 3),
    ('pl-usb-flash-drive', 'chuan_ket_noi', 'USB-C', 4),
    ('pl-usb-flash-drive', 'toc_do_doc', '100 MB/s', 1),
    ('pl-usb-flash-drive', 'toc_do_doc', '150 MB/s', 2),
    ('pl-usb-flash-drive', 'toc_do_doc', '200 MB/s', 3),
    ('pl-usb-flash-drive', 'toc_do_doc', '400 MB/s', 4),
    ('pl-usb-flash-drive', 'chat_lieu_vo', 'Nhựa', 1),
    ('pl-usb-flash-drive', 'chat_lieu_vo', 'Kim loại', 2),
    -- ===== Webcam rời =====
    ('pl-webcam-roi', 'do_phan_giai', 'HD 720p', 1),
    ('pl-webcam-roi', 'do_phan_giai', 'Full HD 1080p', 2),
    ('pl-webcam-roi', 'do_phan_giai', '2K QHD', 3),
    ('pl-webcam-roi', 'do_phan_giai', '4K UHD', 4),
    ('pl-webcam-roi', 'tan_so_khung_hinh', '30 FPS', 1),
    ('pl-webcam-roi', 'tan_so_khung_hinh', '60 FPS', 2),
    ('pl-webcam-roi', 'goc_nhin', '65°', 1),
    ('pl-webcam-roi', 'goc_nhin', '78°', 2),
    ('pl-webcam-roi', 'goc_nhin', '90°', 3),
    ('pl-webcam-roi', 'goc_nhin', '120°', 4),
    ('pl-webcam-roi', 'tinh_nang', 'Tích hợp mic', 1),
    ('pl-webcam-roi', 'tinh_nang', 'Tự động lấy nét', 2),
    ('pl-webcam-roi', 'tinh_nang', 'Chỉnh sáng tự động', 3),
    ('pl-webcam-roi', 'tinh_nang', 'Có nắp che', 4)
) AS v(slug, ma, gia_tri, thu_tu) ON pl.slug = v.slug AND tt.ma_thuoc_tinh = v.ma;

-- ── 3) Dựng lại thong_so_loc cho 13 phân loại vừa seed ─────────────────────
--      (khớp ChiTietThuocTinhLocRepository.rebuildThongSoLoc, làm gộp một lượt).
INSERT INTO chi_tiet_thuoc_tinh_loc (phan_loai_id, thong_so_loc, ngay_tao, ngay_cap_nhat)
SELECT pl.id,
       COALESCE(
         jsonb_object_agg(x.ma, jsonb_build_object('label', x.label, 'values', x.vals))
           FILTER (WHERE x.ma IS NOT NULL),
         '{}'::jsonb),
       now(), now()
FROM phan_loai_san_pham pl
LEFT JOIN LATERAL (
    SELECT tt.ma_thuoc_tinh AS ma,
           tt.ten_thuoc_tinh AS label,
           COALESCE((
             SELECT jsonb_agg(gt.gia_tri ORDER BY gt.thu_tu_hien_thi, gt.id)
             FROM gia_tri_thuoc_tinh gt
             WHERE gt.thuoc_tinh_id = tt.id AND gt.trang_thai = 'ACTIVE'
           ), '[]'::jsonb) AS vals
    FROM thuoc_tinh tt
    WHERE tt.phan_loai_id = pl.id
      AND tt.trang_thai = 'ACTIVE'
      AND tt.ma_thuoc_tinh IS NOT NULL
) x ON true
WHERE pl.slug IN (
    'pl-man-hinh-roi', 'pl-ram', 'pl-sac-pin-laptop', 'pl-o-cung-ssd',
    'pl-ban-phim', 'pl-bo-thu-phat-wifi-bluetooth', 'pl-chuot', 'pl-hub-usb',
    'pl-loa', 'pl-lot-chuot', 'pl-tai-nghe', 'pl-usb-flash-drive', 'pl-webcam-roi'
)
GROUP BY pl.id
ON CONFLICT (phan_loai_id)
DO UPDATE SET thong_so_loc = EXCLUDED.thong_so_loc, ngay_cap_nhat = now();
