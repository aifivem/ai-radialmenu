/** ai-radialmenu's NUI contract. No natives. */

/** One card of the wheel; `items` makes it a category that opens a sub wheel. */
export interface RadialNode {
  /** Path of item ids (`vehicle/engine`): stays the same while conditions change, so a refresh keeps the open level. */
  key: string;
  label: string;
  /** Font Awesome solid icon name without `fa-`, or an image url. */
  icon: string;
  items?: RadialNode[];
}

export interface RadialTexts {
  title: string;
  back: string;
  close: string;
  /** `{0}` page, `{1}` page count. */
  page: string;
  prev: string;
  next: string;
}

/** Client -> NUI messages. */
export type NuiMessage =
  | {
      action: "open";
      /** `key`: the open key as bound now (the wheel closes on it too). */
      data: { items: RadialNode[]; texts: RadialTexts; key: string };
    }
  /** New items for the open wheel (a refresh): the NUI keeps the level the player is on while it still exists. */
  | { action: "update"; data: { items: RadialNode[] } }
  | { action: "close"; data: null };

/** NUI -> client callbacks. */
export const NUI = {
  /** `{ key }` a card without sub items was picked. */
  select: "select",
  close: "close",
} as const;
