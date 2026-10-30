/** Card centre offsets from the wheel centre in vh (tgiann-radialmenu-target "circle" style, the tgiann-emotes wheel). */
export interface Slot {
  x: number;
  y: number;
}

export interface WheelLayout {
  slots: Slot[];
  width: number;
  height: number;
}

export const CARD = { width: 10.45, height: 12.25 };
const GAP = 1.4;
const CENTER_CLEARANCE = 6.6;
const PAIR_HALF_GAP = (CARD.width + GAP) / 2;
const STRETCHES = [0.75, 0.8, 0.85, 0.9, 0.95, 1, 1.05, 1.1, 1.15, 1.2];

/** Clockwise ring: odd counts start at the top, even counts keep a flat top edge; pairs across the axis sit side by side. */
function ringAt(count: number, rx: number, ry: number): Slot[] {
  const start = count % 2 === 1 ? 90 : 90 + 180 / count;
  return Array.from({ length: count }, (_, i) => {
    const angle = ((start - (i * 360) / count) * Math.PI) / 180;
    let x = rx * Math.cos(angle);
    if (Math.abs(x) > 0.01 && Math.abs(x) < CARD.width) x = Math.sign(x) * Math.min(Math.abs(x), PAIR_HALF_GAP);
    return { x, y: -ry * Math.sin(angle) };
  });
}

function fits(slots: Slot[]): boolean {
  for (let i = 0; i < slots.length; i++) {
    const a = slots[i] as Slot;
    const dx = Math.max(Math.abs(a.x) - CARD.width / 2, 0);
    const dy = Math.max(Math.abs(a.y) - CARD.height / 2, 0);
    if (Math.hypot(dx, dy) < CENTER_CLEARANCE) return false;
    for (let j = i + 1; j < slots.length; j++) {
      const b = slots[j] as Slot;
      if (Math.abs(a.x - b.x) < CARD.width + GAP && Math.abs(a.y - b.y) < CARD.height + GAP) return false;
    }
  }
  return true;
}

const boundsOf = (slots: Slot[]) => ({
  width: Math.max(0, ...slots.map((s) => Math.abs(s.x))) * 2 + CARD.width,
  height: Math.max(0, ...slots.map((s) => Math.abs(s.y))) * 2 + CARD.height,
});

const cache = new Map<number, WheelLayout>();

/** The smallest ring (by its larger side) where no card touches another card or the centre disc. */
export function wheelLayout(count: number): WheelLayout {
  const cached = cache.get(count);
  if (cached) return cached;
  let best = ringAt(count, 40, 40);
  let bestSize = Infinity;
  for (const stretch of STRETCHES) {
    for (let r = 10; r <= 40; r += 0.25) {
      const slots = ringAt(count, r, r * stretch);
      if (!fits(slots)) continue;
      const { width, height } = boundsOf(slots);
      if (Math.max(width, height) < bestSize - 0.01) {
        best = slots;
        bestSize = Math.max(width, height);
      }
      break;
    }
  }
  const layout = { slots: best, ...boundsOf(best) };
  cache.set(count, layout);
  return layout;
}
