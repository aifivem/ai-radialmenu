import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { fas, faCircleDot } from "@fortawesome/free-solid-svg-icons";

/**
 * Items come from any script with any Font Awesome solid name (`car`, `map-location-dot`), so the whole solid set is
 * indexed once by name and alias (tgiann-radialmenu does the same).
 */
const byName = new Map<string, IconDefinition>();
for (const definition of Object.values(fas) as IconDefinition[]) {
  byName.set(definition.iconName, definition);
  for (const alias of definition.icon[2])
    if (typeof alias === "string") byName.set(alias, definition);
}

export const iconOf = (name: string): IconDefinition =>
  byName.get(name.trim().toLowerCase()) ?? faCircleDot;

const IMAGE = /^(https?:)?\/\//i;
export const isImage = (icon: string): boolean => IMAGE.test(icon);
