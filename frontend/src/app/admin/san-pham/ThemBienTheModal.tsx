'use client';

import { Layers } from 'lucide-react';
import { Modal } from '../_components/Modal';

/**
 * Thêm biến thể cho một sản phẩm.
 * NỘI DUNG FORM SẼ ĐƯỢC BỔ SUNG theo yêu cầu của bạn (giá, giá KM, tồn, thuộc tính, nhãn, ảnh...).
 */
export function ThemBienTheModal(props: {
  sanPhamId: number;
  tenSanPham: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  return (
    <Modal open title="Thêm biến thể" size="md" onClose={props.onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Sản phẩm: <b className="text-gray-900">{props.tenSanPham}</b>
        </p>
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 py-10 text-center">
          <Layers className="h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-500">
            Biểu mẫu thêm biến thể đang chờ bạn cung cấp nội dung chi tiết.
          </p>
          <p className="text-xs text-gray-400">
            (giá, giá khuyến mãi, tồn kho, thuộc tính, nhãn, ảnh…)
          </p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={props.onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
}
