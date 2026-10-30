import { memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import type { RadialNode } from "../../../resource/common/radial";
import { CARD, type Slot } from "../lib/layout";
import { MenuIcon } from "./MenuIcon";

/** One wheel card (tgiann-emotes card): label top left, big icon, a stack mark on categories, its number key. */
function WheelCardBase({
  item,
  index,
  slot,
  active,
  onPick,
  onHoverStart,
  onHoverEnd,
}: {
  item: RadialNode;
  index: number;
  slot: Slot;
  /** Kept highlighted while the pointer is on its sub item squares. */
  active: boolean;
  onPick: (item: RadialNode) => void;
  onHoverStart: (item: RadialNode, index: number) => void;
  onHoverEnd: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(item)}
      onMouseEnter={() => onHoverStart(item, index)}
      onMouseLeave={onHoverEnd}
      className={`group absolute rounded-[1.4vh] border-[0.1vh] text-left [box-shadow:inset_0_0_3vh_1vh_rgba(0,0,0,0.2)] transition-[border-color,background-color,transform] duration-150 ease-out hover:border-tgi-green hover:bg-tgi-green-10 focus-visible:border-tgi-green active:[transform:scale(0.98)] ${active ? "border-tgi-green bg-tgi-green-10" : "border-white/10 bg-[rgba(217,217,217,0.02)]"}`}
      style={{
        left: `calc(50% + ${slot.x - CARD.width / 2}vh)`,
        top: `calc(50% + ${slot.y - CARD.height / 2}vh)`,
        width: `${CARD.width}vh`,
        height: `${CARD.height}vh`,
      }}
    >
      <span className="absolute top-[1vh] left-[1vh] line-clamp-2 w-[calc(100%-2vh)] text-[1.4vh] leading-[1.2] break-words text-white">
        {item.label}
      </span>
      <span className="pointer-events-none absolute inset-0 top-[1.6vh] flex items-center justify-center">
        <MenuIcon
          icon={item.icon}
          className={`text-[3.6vh] transition-colors duration-150 group-hover:text-tgi-green ${active ? "text-tgi-green" : "text-white/70"}`}
        />
      </span>
      {item.items?.length ? (
        <span
          aria-hidden
          className="absolute bottom-[0.8vh] left-[0.8vh] flex size-[2.8vh] items-center justify-center rounded-full border-[0.1vh] border-white/10"
        >
          <FontAwesomeIcon
            icon={faLayerGroup}
            className="text-[1.2vh] text-text-3"
          />
        </span>
      ) : null}
      <span
        aria-hidden
        className="absolute right-[0.8vh] bottom-[0.8vh] text-[1.4vh] text-text-3 tabular-nums"
      >
        {index === 9 ? 0 : index + 1}
      </span>
    </button>
  );
}

export const WheelCard = memo(WheelCardBase);
