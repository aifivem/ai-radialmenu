import { useRef, type ReactNode } from "react";
import type { Slot } from "../lib/layout";

/** Centre disc (tgiann-emotes CenterIndicator); its green arc turns to the hovered card. */
export function CenterDisc({
  slot,
  children,
}: {
  slot: Slot | null;
  children: ReactNode;
}) {
  const angle = useRef(0);
  if (slot) {
    const target = (Math.atan2(slot.y, slot.x) * 180) / Math.PI;
    // Shortest turn from the last angle, so the arc never spins the long way round.
    angle.current += ((((target - angle.current) % 360) + 540) % 360) - 180;
  }
  return (
    <div className="absolute inset-0 m-auto size-[10vh] rounded-full border-[0.1vh] border-white/10 bg-[rgba(217,217,217,0.02)] [box-shadow:inset_0_0_3vh_1vh_rgba(0,0,0,0.2)]">
      <svg
        viewBox="0 0 158 158"
        fill="none"
        className="pointer-events-none absolute inset-0 size-full"
      >
        <circle
          cx="79"
          cy="79"
          r="77"
          stroke="white"
          strokeOpacity="0.12"
          strokeWidth="2"
        />
        <circle
          cx="79"
          cy="79"
          r="59.2"
          stroke="white"
          strokeOpacity="0.05"
          strokeWidth="2.3"
        />
      </svg>
      <svg
        viewBox="0 0 158 158"
        fill="none"
        className={`pointer-events-none absolute inset-0 size-full [filter:drop-shadow(0_0_0.5vh_var(--green))] transition-[transform,opacity] duration-200 ease-out ${slot ? "opacity-100" : "opacity-0"}`}
        style={{ transform: `rotate(${angle.current}deg)` }}
      >
        <path
          d="M108.6 27.7 A59.2 59.2 0 0 1 108.6 130.3"
          stroke="var(--green)"
          strokeWidth="2.3"
        />
        <path d="M138 76H139L145.5 79L139 82H138V76Z" fill="white" />
      </svg>
      {children}
    </div>
  );
}
