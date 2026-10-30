import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { fetchNui } from "fivem-nui-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faDoorOpen } from "@fortawesome/free-solid-svg-icons";
import type { RadialNode } from "../../../resource/common/radial";
import {
  closed,
  entered,
  PAGE_SIZE,
  turned,
  wentBack,
} from "../features/wheel";
import { useHoverPopup, useWheelKeys } from "../hooks";
import { wheelLayout, type Slot } from "../lib/layout";
import { levelVariants } from "../lib/motion";
import { subOverflow, subSlots } from "../lib/subSlots";
import { useAppDispatch, useAppSelector } from "../store";
import { CenterDisc } from "./CenterDisc";
import { Pagination } from "./Pagination";
import { SubSquares } from "./SubSquares";
import { WheelCard } from "./WheelCard";

const OK = { mockData: true };

/** The wheel: cards on a ring around the centre disc, pages of 10, categories open a sub wheel or show sub squares. */
export function Wheel() {
  const dispatch = useAppDispatch();
  const { levels, nav, texts, key: openKey } = useAppSelector((s) => s.wheel);
  const level = levels.at(-1);
  const [hover, setHover] = useState<number | null>(null);
  const popup = useHoverPopup();

  const page = level?.page ?? 0;
  const all = level?.items;
  const pageItems = useMemo(
    () => (all ?? []).slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [all, page],
  );
  const pages = Math.max(1, Math.ceil((all?.length ?? 0) / PAGE_SIZE));
  const layout = wheelLayout(pageItems.length);
  // The fullest page sizes the box, so turning pages never resizes the wheel.
  const box = wheelLayout(Math.min(all?.length ?? 0, PAGE_SIZE));
  const cards = layout.slots.slice(0, pageItems.length);
  const overflow = useMemo(
    () =>
      subOverflow(
        pageItems.map((i) => i.items?.length ?? 0),
        cards,
        layout.height,
      ),
    [pageItems, cards, layout.height],
  );

  const { reset } = popup;
  useEffect(() => {
    reset();
    setHover(null);
  }, [pageItems, reset]);

  const close = useCallback(() => {
    dispatch(closed());
    void fetchNui("close", undefined, OK);
  }, [dispatch]);
  const pick = useCallback(
    (item: RadialNode) => {
      if (item.items?.length) dispatch(entered(item));
      else void fetchNui("select", { key: item.key }, OK);
    },
    [dispatch],
  );
  const back = useCallback(
    () => (levels.length > 1 ? dispatch(wentBack()) : close()),
    [levels.length, dispatch, close],
  );
  const turn = useCallback((d: 1 | -1) => void dispatch(turned(d)), [dispatch]);
  useWheelKeys({ openKey, pageItems, pick, back, close, turn });

  if (!level || !texts) return null;
  const popupItem = popup.index !== null ? pageItems[popup.index] : undefined;
  const popupCard = popup.index !== null ? cards[popup.index] : undefined;
  const canGoBack = levels.length > 1;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      onMouseDown={(e) => {
        if (e.button === 0 && !(e.target as Element).closest("button")) close();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        back();
      }}
    >
      {/* Soft circular darkening centred on the wheel (tgiann-emotes WheelGlow). */}
      <div className="pointer-events-none absolute inset-0 m-auto size-[120vh] animate-fade [background:radial-gradient(circle_closest-side,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.78)_35%,rgba(0,0,0,0.68)_47%,rgba(0,0,0,0.52)_60%,rgba(0,0,0,0.34)_72%,rgba(0,0,0,0.18)_85%,rgba(0,0,0,0.06)_93%,rgba(0,0,0,0)_100%)]" />
      <div
        className="relative flex flex-col items-center gap-[2vh]"
        onWheel={(e) => Math.abs(e.deltaY) >= 1 && turn(e.deltaY > 0 ? 1 : -1)}
      >
        <p className="max-w-[60vh] truncate font-display text-[3vh] leading-[1.2] tracking-[-0.01em] text-tgi-green uppercase">
          {level.title ?? texts.title}
        </p>
        <div
          className="relative"
          style={{
            marginTop: `${overflow}vh`,
            width: `${Math.max(layout.width, box.width, 12)}vh`,
            height: `${Math.max(layout.height, box.height, 12)}vh`,
          }}
        >
          <AnimatePresence custom={nav}>
            <motion.div
              key={`${level.key ?? "root"}:${page}`}
              custom={nav}
              variants={levelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0"
            >
              {pageItems.map((item, i) => (
                <WheelCard
                  key={item.key}
                  item={item}
                  index={i}
                  slot={cards[i] as Slot}
                  active={popup.index === i}
                  onPick={pick}
                  onHoverStart={(it, at) => {
                    setHover(at);
                    if (it.items?.length) popup.open(at);
                    else popup.reset();
                  }}
                  onHoverEnd={() => {
                    setHover(null);
                    popup.scheduleClose();
                  }}
                />
              ))}
              {popupItem?.items && popupCard && (
                <SubSquares
                  key={popupItem.key}
                  items={popupItem.items}
                  slots={subSlots(popupCard, cards, popupItem.items.length)}
                  onPick={(item) => {
                    popup.reset();
                    pick(item);
                  }}
                  onEnter={popup.cancelClose}
                  onLeave={popup.scheduleClose}
                />
              )}
            </motion.div>
          </AnimatePresence>
          <CenterDisc slot={hover !== null ? (cards[hover] ?? null) : null}>
            <button
              type="button"
              aria-label={canGoBack ? texts.back : texts.close}
              title={canGoBack ? texts.back : texts.close}
              onClick={back}
              className="absolute inset-[1.6vh] flex items-center justify-center rounded-full text-white/70 transition-[color,transform] duration-150 ease-out hover:text-tgi-green focus-visible:text-tgi-green active:[transform:scale(0.94)]"
            >
              <FontAwesomeIcon
                icon={canGoBack ? faArrowLeft : faDoorOpen}
                className="text-[1.8vh]"
              />
            </button>
          </CenterDisc>
        </div>
        {pages > 1 && (
          <Pagination page={page} pages={pages} texts={texts} onTurn={turn} />
        )}
      </div>
    </div>
  );
}
