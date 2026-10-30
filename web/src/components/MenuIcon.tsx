import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { iconOf, isImage } from "../lib/icons";

/** An item icon: a Font Awesome name or an image url, both sized by the font size in `className`. */
export function MenuIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  if (isImage(icon))
    return (
      <img
        src={icon}
        alt=""
        draggable={false}
        className={`size-[1.1em] object-contain ${className ?? ""}`}
      />
    );
  return <FontAwesomeIcon icon={iconOf(icon)} className={className} />;
}
