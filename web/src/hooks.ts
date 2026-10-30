import { useCallback, useEffect, useRef, useState } from "react";
import type { RadialNode } from "../../resource/common/radial";

/** Which category shows its sub squares on hover, with a short grace time so the pointer can travel to them. */
export function useHoverPopup() {
  const [index, setIndex] = useState<number | null>(null);
  const timer = useRef<number | null>(null);

  const cancelClose = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const reset = useCallback(() => {
    cancelClose();
    setIndex(null);
  }, [cancelClose]);
  const scheduleClose = useCallback(() => {
    cancelClose();
    timer.current = window.setTimeout(() => setIndex(null), 200);
  }, [cancelClose]);
  const open = useCallback(
    (i: number) => {
      cancelClose();
      setIndex(i);
    },
    [cancelClose],
  );
  useEffect(() => cancelClose, [cancelClose]);

  return { index, open, reset, cancelClose, scheduleClose };
}

const NUMBER_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

/**
 * Keys of the open wheel: 1-9 and 0 pick a card, Backspace goes back, arrows turn pages, Escape closes when it comes
 * up (on the press the game would get the release and open the pause menu), the open key closes on a fresh press.
 */
export function useWheelKeys(o: {
  openKey: string;
  pageItems: RadialNode[];
  pick: (item: RadialNode) => void;
  back: () => void;
  close: () => void;
  turn: (direction: 1 | -1) => void;
}) {
  const ref = useRef(o);
  ref.current = o;
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const { openKey, pageItems, pick, back, close, turn } = ref.current;
      if (e.repeat) return;
      if (e.key.toUpperCase() === openKey || e.code.toUpperCase() === openKey)
        return close();
      if (e.key === "Backspace") return back();
      if (e.key === "ArrowLeft") return turn(-1);
      if (e.key === "ArrowRight") return turn(1);
      const n = NUMBER_KEYS.indexOf(e.key);
      const item = n >= 0 ? pageItems[n] : undefined;
      if (item) pick(item);
    };
    const up = (e: KeyboardEvent) => e.key === "Escape" && ref.current.close();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
}
