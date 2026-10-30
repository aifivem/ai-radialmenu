import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import type { RadialTexts } from "../../../resource/common/radial";

function Arrow({
  right,
  label,
  disabled,
  onClick,
}: {
  right?: boolean;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-[3.6vh] items-center justify-center rounded-[0.8vh] border-[0.1vh] border-white/10 bg-control text-white/80 transition-[background-color,color,transform] duration-150 ease-out enabled:hover:bg-control-hover enabled:hover:text-white enabled:active:[transform:scale(0.94)] disabled:opacity-40"
    >
      <FontAwesomeIcon
        icon={right ? faArrowRight : faArrowLeft}
        className="text-[1.4vh]"
      />
    </button>
  );
}

/** Arrows, page text and dots under the wheel (tgiann-emotes pagination row). */
export function Pagination({
  page,
  pages,
  texts,
  onTurn,
}: {
  page: number;
  pages: number;
  texts: RadialTexts;
  onTurn: (direction: 1 | -1) => void;
}) {
  return (
    <div className="flex items-center gap-[2vh]">
      <Arrow
        label={texts.prev}
        disabled={page === 0}
        onClick={() => onTurn(-1)}
      />
      <div className="flex min-w-[14vh] flex-col items-center gap-[0.8vh]">
        <p className="text-[1.4vh] font-semibold text-white tabular-nums">
          {texts.page
            .replace("{0}", String(page + 1))
            .replace("{1}", String(pages))}
        </p>
        <div aria-hidden className="flex items-center gap-[0.5vh]">
          {Array.from({ length: pages }, (_, i) => (
            <span
              key={i}
              className={`rounded-full transition-[background-color] duration-150 ${i === page ? "size-[0.6vh] bg-white" : "size-[0.4vh] bg-white/20"}`}
            />
          ))}
        </div>
      </div>
      <Arrow
        right
        label={texts.next}
        disabled={page === pages - 1}
        onClick={() => onTurn(1)}
      />
    </div>
  );
}
