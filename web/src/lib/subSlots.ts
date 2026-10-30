import { CARD, type Slot } from "./layout";

/** Icon squares around a hovered category card (tgiann-radialmenu-target), in vh. */
export const SUB_SIZE = 5;

// Every square sits on one grid centred on the card, so neighbouring squares are always the same distance apart.
const STEP = 6.3;
const HALF_W = CARD.width / 2;
const HALF_H = CARD.height / 2;
const CENTER_DISC = 5.6;
const GAP = STEP - SUB_SIZE;

/** "ring": touching the card, "line": its rows and columns carried past the corners, "outer": a second ring. */
interface Cell extends Slot {
  kind: "ring" | "line" | "outer";
  along?: "x" | "y";
}

function buildCells(): Cell[] {
  const cells: Cell[] = [];
  const steps = [-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5];
  for (const a of steps)
    for (const b of steps) {
      const ax = Math.abs(a);
      const ay = Math.abs(b);
      const cell = { x: a * STEP, y: b * STEP };
      if (Math.max(ax, ay) === 1.5) cells.push({ ...cell, kind: "ring" });
      else if (ay === 1.5 && ax > 1.5)
        cells.push({ ...cell, kind: "line", along: "x" });
      else if (ax === 1.5 && ay > 1.5)
        cells.push({ ...cell, kind: "line", along: "y" });
      else if (Math.max(ax, ay) === 2.5) cells.push({ ...cell, kind: "outer" });
    }
  return cells;
}

const CELLS = buildCells();

const hitsCard = (cell: Slot, card: Slot) =>
  Math.abs(cell.x - card.x) < HALF_W + SUB_SIZE / 2 + GAP / 2 &&
  Math.abs(cell.y - card.y) < HALF_H + SUB_SIZE / 2 + GAP / 2;

const hitsSquare = (a: Slot, b: Slot) =>
  Math.abs(a.x - b.x) < SUB_SIZE + GAP / 2 &&
  Math.abs(a.y - b.y) < SUB_SIZE + GAP / 2;

const hitsCentre = (cell: Slot) => {
  const dx = Math.max(Math.abs(cell.x) - SUB_SIZE / 2, 0);
  const dy = Math.max(Math.abs(cell.y) - SUB_SIZE / 2, 0);
  return Math.hypot(dx, dy) < CENTER_DISC;
};

interface Candidate {
  offset: Cell;
  slot: Slot;
}

/**
 * Free cells next to the card: the ring facing away from the wheel centre first, then its rows and columns towards
 * the middle of the wheel (squares stay grouped); returned clockwise so they read around the card.
 */
export function subSlots(card: Slot, cards: Slot[], count: number): Slot[] {
  const length = Math.hypot(card.x, card.y) || 1;
  const dir = { x: card.x / length, y: card.y / length };
  const facing = (o: Slot) =>
    (o.x * dir.x + o.y * dir.y) / Math.hypot(o.x, o.y);

  const score = ({ offset, slot }: Candidate) => {
    if (offset.kind === "ring") {
      const value = facing(offset);
      return value < 0 ? value - 1.5 : value;
    }
    if (offset.kind === "line") {
      const along = offset.along ?? "x";
      const across = along === "x" ? "y" : "x";
      const inward = offset[across] * dir[across] < 0 ? 1.5 : 0;
      return -0.6 - inward - 0.02 * Math.abs(slot[along]);
    }
    return -2 + facing(offset);
  };

  const candidates = CELLS.map((offset) => ({
    offset,
    slot: { x: card.x + offset.x, y: card.y + offset.y },
  }))
    .filter(
      ({ slot }) =>
        !hitsCentre(slot) && !cards.some((other) => hitsCard(slot, other)),
    )
    .sort((a, b) => score(b) - score(a));

  const picked: Candidate[] = [];
  for (const c of candidates) {
    if (picked.length >= count) break;
    if (picked.some((other) => hitsSquare(c.slot, other.slot))) continue;
    picked.push(c);
  }
  return picked
    .sort(
      (a, b) =>
        Math.atan2(a.offset.y, a.offset.x) - Math.atan2(b.offset.y, b.offset.x),
    )
    .map(({ slot }) => slot);
}

/** How far sub squares of any card on the page rise above the wheel: kept free under the title. */
export function subOverflow(
  counts: number[],
  cards: Slot[],
  height: number,
): number {
  let top = -height / 2;
  counts.forEach((count, i) => {
    const card = cards[i];
    if (!count || !card) return;
    for (const slot of subSlots(card, cards, count))
      top = Math.min(top, slot.y - SUB_SIZE / 2);
  });
  return Math.max(0, -height / 2 - top);
}
