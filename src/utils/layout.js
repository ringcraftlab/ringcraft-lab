import { A4 } from '../config/sizes';

// A4に何枚入るか自動計算
export function calcLayout(refillW, refillH, orientation) {
  const paper = A4[orientation];
  const cols = Math.floor(paper.w / refillW);
  const rows = Math.floor(paper.h / refillH);
  const total = cols * rows;

  // 余白（センタリング）
  const marginX = (paper.w - cols * refillW) / 2;
  const marginY = (paper.h - rows * refillH) / 2;

  return { cols, rows, total, marginX, marginY };
}

// 縦横どちらが多く入るか自動選択
export function bestOrientation(refillW, refillH) {
  const portrait  = calcLayout(refillW, refillH, 'portrait');
  const landscape = calcLayout(refillW, refillH, 'landscape');
  return portrait.total >= landscape.total ? 'portrait' : 'landscape';
}

// mm → px変換（96dpi基準）
export const MM_TO_PX = 3.7795;
export const mmToPx = (mm) => mm * MM_TO_PX;