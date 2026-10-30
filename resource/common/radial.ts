/** ai-radialmenu's NUI contract. No natives. */

/** One slice of the wheel; `children` opens a sub wheel. */
export interface RadialView {
  id: string;
  label: string;
  /** Font Awesome solid icon name without `fa-`. */
  icon: string;
  children?: RadialView[];
}

/** Client -> NUI messages. */
export type NuiMessage =
  | {
      action: "open";
      /** `key`: the open key as bound now (the wheel closes on it too). */
      data: { items: RadialView[]; back: string; key: string };
    }
  | { action: "close"; data: null };
