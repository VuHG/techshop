'use client';

import { useEffect, useState } from 'react';

interface Countdown {
  gio: string;
  phut: string;
  giay: string;
  ketThuc: boolean;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/**
 * Đếm ngược tới một mốc thời gian (mặc định: cuối ngày hôm nay).
 * Countdown chạy hoàn toàn phía FE — KHÔNG có logic flash-sale ở backend.
 */
export function useCountdown(target?: Date): Countdown {
  const getTarget = () => {
    if (target) return target.getTime();
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return end.getTime();
  };

  const tinh = (): Countdown => {
    const conLai = Math.max(0, getTarget() - Date.now());
    const gio = Math.floor(conLai / 3_600_000);
    const phut = Math.floor((conLai % 3_600_000) / 60_000);
    const giay = Math.floor((conLai % 60_000) / 1000);
    return { gio: pad(gio), phut: pad(phut), giay: pad(giay), ketThuc: conLai === 0 };
  };

  const [time, setTime] = useState<Countdown>({ gio: '00', phut: '00', giay: '00', ketThuc: false });

  useEffect(() => {
    setTime(tinh());
    const id = setInterval(() => setTime(tinh()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return time;
}
