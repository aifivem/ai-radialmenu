import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  NuiMessage,
  RadialNode,
  RadialTexts,
} from "../../../resource/common/radial";

/** Cards per page: the 1-9 and 0 keys pick them. */
export const PAGE_SIZE = 10;

export interface Level {
  /** Key of the category, null on the main wheel. */
  key: string | null;
  title: string | null;
  items: RadialNode[];
  page: number;
}

/** Last navigation step: picks the direction of the level / page transition. */
export type Nav = "open" | "enter" | "back" | "next" | "prev" | "refresh";

type OpenData = Extract<NuiMessage, { action: "open" }>["data"];

interface State {
  levels: Level[];
  nav: Nav;
  texts: RadialTexts | null;
  key: string;
}

const initialState: State = { levels: [], nav: "open", texts: null, key: "" };
const pageCount = (level: Level) =>
  Math.max(1, Math.ceil(level.items.length / PAGE_SIZE));

export const wheel = createSlice({
  name: "wheel",
  initialState,
  reducers: {
    opened: (state, { payload }: PayloadAction<OpenData>) => {
      state.nav = "open";
      state.texts = payload.texts;
      state.key = payload.key;
      state.levels = [
        { key: null, title: null, items: payload.items, page: 0 },
      ];
    },
    closed: (state) => {
      state.levels = [];
    },
    entered: (state, { payload }: PayloadAction<RadialNode>) => {
      if (!payload.items?.length) return;
      state.nav = "enter";
      state.levels.push({
        key: payload.key,
        title: payload.label,
        items: payload.items,
        page: 0,
      });
    },
    wentBack: (state) => {
      if (state.levels.length <= 1) return;
      state.nav = "back";
      state.levels.pop();
    },
    turned: (state, { payload }: PayloadAction<1 | -1>) => {
      const level = state.levels.at(-1);
      if (!level) return;
      const next = Math.min(
        Math.max(level.page + payload, 0),
        pageCount(level) - 1,
      );
      if (next === level.page) return;
      state.nav = payload > 0 ? "next" : "prev";
      level.page = next;
    },
    /** New items for the open wheel: walks the old category path again and stops where a category is gone. */
    updated: (state, { payload }: PayloadAction<RadialNode[]>) => {
      if (state.levels.length === 0) return;
      const levels: Level[] = [
        {
          key: null,
          title: null,
          items: payload,
          page: state.levels[0]?.page ?? 0,
        },
      ];
      for (const old of state.levels.slice(1)) {
        const parent = levels.at(-1)?.items.find((i) => i.key === old.key);
        if (!parent?.items?.length) break;
        levels.push({
          key: parent.key,
          title: parent.label,
          items: parent.items,
          page: old.page,
        });
      }
      for (const level of levels)
        level.page = Math.min(level.page, pageCount(level) - 1);
      state.nav = "refresh";
      state.levels = levels;
    },
  },
});

export const { opened, closed, entered, wentBack, turned, updated } =
  wheel.actions;
