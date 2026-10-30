import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { fetchNui, useNuiEvent } from "fivem-nui-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import type { NuiMessage, RadialView } from "../../resource/common/radial";
import { MOCK_OPEN } from "./dev/mock";
import { iconOf } from "./lib/icons";
import { CARD, wheelLayout, type Slot } from "./lib/layout";

type OpenData = Extract<NuiMessage, { action: "open" }>["data"];
const OPEN_MOCK = { mockData: MOCK_OPEN, mockDelay: 100 };
const OK = { mockData: true };
/** glide(0.25, 0) from tgiann-ui nui-performance: compositor tween. */
const ENTER = {
  type: "tween",
  duration: 0.3,
  ease: [0.22, 0.189, 0.141, 1.034],
} as const;

/** Centre disc (tgiann-emotes CenterIndicator); its green arc turns to the hovered card. */
function CenterDisc({
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

/** One wheel card: label top left, big icon in the middle, a stack mark when it opens a sub wheel. */
function Card({
  item,
  slot,
  active,
  onEnter,
  onLeave,
  onPick,
}: {
  item: RadialView;
  slot: Slot;
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={`group absolute rounded-[1.4vh] border-[0.1vh] text-left [box-shadow:inset_0_0_3vh_1vh_rgba(0,0,0,0.2)] transition-[border-color,background-color,transform] duration-150 ease-out active:[transform:scale(0.98)] ${active ? "border-tgi-green bg-tgi-green-10" : "border-white/10 bg-[rgba(217,217,217,0.02)]"}`}
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
        <FontAwesomeIcon
          icon={iconOf(item.icon)}
          className={`text-[3.6vh] transition-colors duration-150 ${active ? "text-tgi-green" : "text-white/70"}`}
        />
      </span>
      {item.children?.length ? (
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
    </button>
  );
}

/** The wheel: cards in a ring around the centre disc; a card with children opens its sub wheel, the centre goes back. */
export function App() {
  const [data, setData] = useState<OpenData | null>(null);
  const [path, setPath] = useState<string[]>([]);
  const [hover, setHover] = useState<number | null>(null);

  useNuiEvent<OpenData>(
    "open",
    (d) => {
      setData(d);
      setPath([]);
    },
    OPEN_MOCK,
  );
  useNuiEvent("close", () => setData(null));
  useEffect(() => {
    // A held key repeats keydown: only a fresh press closes, or holding the open key closes and reopens the wheel.
    const onKey = (e: KeyboardEvent) =>
      !e.repeat &&
      (e.key === "Escape" ||
        e.key.toUpperCase() === data?.key ||
        e.code.toUpperCase() === data?.key) &&
      data &&
      void fetchNui("close", undefined, OK);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data]);

  if (!data) return null;
  let items: RadialView[] = data.items;
  let title = "";
  for (const id of path) {
    const parent = items.find((i) => i.id === id);
    title = parent?.label ?? "";
    items = parent?.children ?? [];
  }
  const layout = wheelLayout(items.length);
  const pick = (item: RadialView) => {
    setHover(null);
    if (item.children?.length) setPath([...path, item.id]);
    else void fetchNui("select", { path: [...path, item.id] }, OK);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      // A click anywhere but on a slice or the centre button closes the wheel.
      onMouseDown={(e) => {
        if (e.button === 0 && !(e.target as Element).closest("button"))
          void fetchNui("close", undefined, OK);
      }}
    >
      {/* Soft circular darkening centred on the wheel (tgiann-emotes WheelGlow). */}
      <div className="pointer-events-none absolute inset-0 m-auto size-[120vh] animate-fade [background:radial-gradient(circle_closest-side,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.78)_35%,rgba(0,0,0,0.68)_47%,rgba(0,0,0,0.52)_60%,rgba(0,0,0,0.34)_72%,rgba(0,0,0,0.18)_85%,rgba(0,0,0,0.06)_93%,rgba(0,0,0,0)_100%)]" />
      <div className="relative flex flex-col items-center gap-[2vh]">
        {title && (
          <p className="max-w-[60vh] truncate font-display text-[3vh] leading-[1.2] tracking-[-0.01em] text-tgi-green uppercase">
            {title}
          </p>
        )}
        <div
          className="relative"
          style={{
            width: `${Math.max(layout.width, 12)}vh`,
            height: `${Math.max(layout.height, 12)}vh`,
          }}
        >
          <motion.div
            key={path.join("/")}
            initial={{ opacity: 0, transform: "scale(0.94)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            transition={ENTER}
            className="absolute inset-0"
          >
            {items.map((item, i) => (
              <Card
                key={item.id}
                item={item}
                slot={layout.slots[i] as Slot}
                active={hover === i}
                onEnter={() => setHover(i)}
                onLeave={() => setHover(null)}
                onPick={() => pick(item)}
              />
            ))}
          </motion.div>
          <CenterDisc
            slot={hover !== null ? (layout.slots[hover] ?? null) : null}
          >
            <button
              type="button"
              aria-label={data.back}
              title={data.back}
              disabled={path.length === 0}
              onClick={() => setPath(path.slice(0, -1))}
              className="absolute inset-[1.6vh] flex items-center justify-center rounded-full text-white/70 transition-[color,transform] duration-150 ease-out enabled:hover:text-tgi-green enabled:active:[transform:scale(0.94)] disabled:cursor-default"
            >
              {path.length > 0 && (
                <FontAwesomeIcon icon={faArrowLeft} className="text-[1.8vh]" />
              )}
            </button>
          </CenterDisc>
        </div>
      </div>
    </div>
  );
}
