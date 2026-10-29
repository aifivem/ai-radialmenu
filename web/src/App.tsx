import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { fetchNui, useNuiEvent } from "fivem-nui-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import type { NuiMessage, RadialView } from "../../resource/common/radial";
import { MOCK_OPEN } from "./dev/mock";
import { iconOf } from "./lib/icons";

type OpenData = Extract<NuiMessage, { action: "open" }>["data"];
const OPEN_MOCK = { mockData: MOCK_OPEN, mockDelay: 100 };
const OK = { mockData: true };
const SIZE = 420;
const R_OUT = 200;
const R_IN = 78;

/** SVG path of one ring slice from angle a0 to a1 (radians, 0 = up, clockwise). */
function slice(a0: number, a1: number): string {
  const p = (r: number, a: number) => `${SIZE / 2 + r * Math.sin(a)} ${SIZE / 2 - r * Math.cos(a)}`;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${p(R_IN, a0)} L ${p(R_OUT, a0)} A ${R_OUT} ${R_OUT} 0 ${large} 1 ${p(R_OUT, a1)} L ${p(R_IN, a1)} A ${R_IN} ${R_IN} 0 ${large} 0 ${p(R_IN, a0)} Z`;
}

/** The wheel: slices around the centre, the hovered one in accent; a slice with children opens its sub wheel. */
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
    const onKey = (e: KeyboardEvent) => (e.key === "Escape" || e.key === "F1") && data && void fetchNui("close", undefined, OK);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data]);

  if (!data) return null;
  let items: RadialView[] = data.items;
  for (const id of path) items = items.find((i) => i.id === id)?.children ?? [];
  const step = (Math.PI * 2) / Math.max(1, items.length);
  const pick = (item: RadialView) => {
    setHover(null);
    if (item.children?.length) setPath([...path, item.id]);
    else void fetchNui("select", { path: [...path, item.id] }, OK);
  };
  const label = hover !== null ? items[hover]?.label : path.length ? data.back : "";

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <motion.div
        key={path.join("/")}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.25, bounce: 0 }}
        className="relative"
        style={{ width: `${SIZE / 10.8}vh`, height: `${SIZE / 10.8}vh` }}
      >
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 size-full">
          {items.map((item, i) => (
            <path
              key={item.id}
              d={slice(i * step + 0.02, (i + 1) * step - 0.02)}
              className="cursor-pointer transition-[fill] duration-150"
              fill={hover === i ? "rgba(54,255,159,0.16)" : "rgba(17,22,25,0.92)"}
              stroke={hover === i ? "var(--accent)" : "var(--line)"}
              strokeWidth="1.5"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => pick(item)}
            />
          ))}
        </svg>
        {items.map((item, i) => {
          const a = (i + 0.5) * step;
          const r = (R_IN + R_OUT) / 2;
          return (
            <FontAwesomeIcon
              key={item.id}
              icon={iconOf(item.icon)}
              className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-[2.4vh] ${hover === i ? "text-accent" : "text-text-2"}`}
              style={{ left: `${((SIZE / 2 + r * Math.sin(a)) / SIZE) * 100}%`, top: `${((SIZE / 2 - r * Math.cos(a)) / SIZE) * 100}%` }}
            />
          );
        })}
        <button
          type="button"
          aria-label={data.back}
          disabled={path.length === 0}
          onClick={() => setPath(path.slice(0, -1))}
          className="absolute left-1/2 top-1/2 flex size-[12vh] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-[0.6vh] rounded-full border border-line bg-panel text-center"
        >
          {path.length > 0 && hover === null && <FontAwesomeIcon icon={faArrowLeft} className="text-[1.6vh] text-text-3" />}
          <span className="max-w-[10vh] text-[1.3vh] font-medium leading-tight text-text">{label}</span>
        </button>
      </motion.div>
    </div>
  );
}
