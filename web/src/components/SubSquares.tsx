import { useState } from "react";
import type { RadialNode } from "../../../resource/common/radial";
import type { Slot } from "../lib/layout";
import { SUB_SIZE } from "../lib/subSlots";
import { MenuIcon } from "./MenuIcon";

/** Icon squares around a hovered category card: picking one skips opening the category; the name shows on hover. */
export function SubSquares({
  items,
  slots,
  onPick,
  onEnter,
  onLeave,
}: {
  items: RadialNode[];
  slots: Slot[];
  onPick: (item: RadialNode) => void;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <>
      {slots.map((slot, i) => {
        const item = items[i];
        if (!item) return null;
        const on = hovered === item.key;
        return (
          <button
            key={item.key}
            type="button"
            aria-label={item.label}
            onClick={() => onPick(item)}
            onMouseEnter={() => {
              onEnter();
              setHovered(item.key);
            }}
            onMouseLeave={() => {
              onLeave();
              setHovered(null);
            }}
            className={`absolute flex animate-fade items-center justify-center rounded-[1vh] border-[0.1vh] bg-[rgba(20,20,20,0.55)] [box-shadow:inset_0_0_2vh_0.5vh_rgba(0,0,0,0.2)] transition-[border-color,background-color,transform] duration-150 ease-out focus-visible:border-tgi-green active:[transform:scale(0.94)] ${on ? "z-30 border-tgi-green bg-tgi-green-10" : "z-20 border-white/10"}`}
            style={{
              left: `calc(50% + ${slot.x - SUB_SIZE / 2}vh)`,
              top: `calc(50% + ${slot.y - SUB_SIZE / 2}vh)`,
              width: `${SUB_SIZE}vh`,
              height: `${SUB_SIZE}vh`,
            }}
          >
            <MenuIcon
              icon={item.icon}
              className={`text-[2.2vh] transition-colors duration-150 ${on ? "text-tgi-green" : "text-white/80"}`}
            />
            {on && (
              // Flex centring instead of a transform keeps the text sharp in the game browser.
              <span className="pointer-events-none absolute right-0 bottom-[calc(100%+0.6vh)] left-0 flex justify-center">
                <span className="shrink-0 animate-fade rounded-[0.6vh] border-[0.1vh] border-white/10 bg-float px-[0.8vh] py-[0.4vh] text-[1.2vh] font-medium whitespace-nowrap text-white/90">
                  {item.label}
                </span>
              </span>
            )}
          </button>
        );
      })}
    </>
  );
}
