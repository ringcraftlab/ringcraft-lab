export const SIZES = [
  {
    id: 'microfive',
    name: 'マイクロ5',
    shortName: 'M5',
    w: 62,
    h: 105,
    holePosY: [14.5, 33.5, 52.5, 71.5, 90.5],
  },
  {
    id: 'mini6',
    name: 'ミニ6',
    shortName: 'M6',
    w: 80,
    h: 126,
    holePosY: [15.5, 34.5, 53.5, 72.5, 91.5, 110.5],
  },
  {
    id: 'bible',
    name: 'バイブル',
    w: 95,
    h: 170,
    holePosY: [21.5, 40.5, 59.5, 110.5, 129.5, 148.5],
  },
  {
    id: 'm5square',
    name: 'M5スクエア',
    shortName: 'M5スクエア',
    w: 105,
    h: 105,
    holePosY: [14.5, 33.5, 52.5, 71.5, 90.5],
  },
  {
    id: 'custom',
    name: 'カスタム',
    w: null,
    h: null,
    holePosY: null,
    // 穴規格を選べる
    holeStandard: 'mini6',
  },
];

export const HOLE_STANDARDS = [
  { id: 'microfive', name: 'マイクロ5穴' },
  { id: 'mini6',    name: 'ミニ6穴' },
  { id: 'bible',    name: 'バイブル穴' },
  { id: 'm5square', name: 'M5スクエア穴' },
];

export const A4 = {
  portrait:  { w: 210, h: 297 },
  landscape: { w: 297, h: 210 },
};

export function getHolePositions(size, customHoleStandard) {
  if (!size) return [];
  if (size.id === 'custom') {
    const standard = SIZES.find(s => s.id === (customHoleStandard || 'mini6'));
    return standard.holePosY;
  }
  return size.holePosY;
}