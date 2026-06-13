package com.techshop.module.review.repository;

import com.techshop.module.review.entity.DanhGiaMedia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DanhGiaMediaRepository extends JpaRepository<DanhGiaMedia, Long> {

    List<DanhGiaMedia> findByDanhGiaIdInOrderByDanhGiaIdAscThuTuAsc(List<Long> danhGiaIds);
}
