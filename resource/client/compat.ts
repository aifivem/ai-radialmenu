import { callExport, isResourceStarted } from "@aicore-fivem/lib/client";
import { createLogger, isRecord } from "@aicore-fivem/lib/shared";
import type { Item } from "./registry";

const log = createLogger("ai-radialmenu");
const IMAGE = /^(https?:)?\/\//i;
const str = (v: unknown, max: number): string | undefined =>
  typeof v === "string" && v.length > 0 ? v.slice(0, max) : undefined;

/** `fas fa-car`, `fa-solid fa-car`, `fa-car` -> `car`; image urls stay. */
export function iconName(v: unknown): string {
  const raw = str(v, 300)?.trim();
  if (!raw) return "circle";
  if (IMAGE.test(raw)) return raw;
  return (raw.split(/\s+/).pop() ?? raw).replace(/^fa-/, "");
}

/** A text, or tgiann-radialmenu's `{ en = "...", tr = "..." }` in the server language (else English, else any). */
function label(v: unknown): string | undefined {
  if (!isRecord(v)) return str(v, 48);
  const lang = GetConvar("ai:locale", "en");
  return str(v[lang], 48) ?? str(v.en, 48) ?? str(Object.values(v)[0], 48);
}

/** What an event item sends: the item's plain fields, its `args`, and its id (qb-radialmenu / tgiann-radialmenu). */
function payloadOf(v: Record<string, unknown>, id: string) {
  const out: Record<string, unknown> = {};
  for (const [k, value] of Object.entries(v))
    if (typeof value !== "function" && k !== "items") out[k] = value;
  return { ...out, ...(isRecord(v.args) ? v.args : {}), id };
}

/** The action of any API: a function, an event (client / server / command / qbcommand), a command or an export. */
function actionOf(
  v: Record<string, unknown>,
  id: string,
): (() => void) | undefined {
  const args = v.args;
  for (const key of ["onPressed", "onSelect", "action"])
    if (typeof v[key] === "function") {
      const fn = v[key] as (a?: unknown) => void;
      return key === "onPressed" ? () => fn() : () => fn(args);
    }
  const command = str(v.command, 200);
  if (command) return () => ExecuteCommand(command.replace(/^\s*\//, ""));
  const event = str(v.event, 200);
  if (event) {
    const payload = payloadOf(v, id);
    switch (v.type) {
      case "server":
        return () => emitNet(event, payload);
      case "command":
        return () => ExecuteCommand(event);
      case "qbcommand":
        return () => emitNet("QBCore:CallCommand", event, payload);
      default:
        return () => emit(event, payload);
    }
  }
  const ex = v.export;
  if (
    isRecord(ex) &&
    typeof ex.resource === "string" &&
    typeof ex.name === "string"
  ) {
    const { resource, name } = ex;
    const list = Array.isArray(ex.args) ? ex.args : [];
    return () => {
      if (!isResourceStarted(resource))
        return log.warn(`radial item ${id}: ${resource} is not started`);
      callExport(resource, name, ...list);
    };
  }
  return undefined;
}

/**
 * One item from any API, read into ai-radialmenu's shape: lib `radial` / `AddItem` (`canShow`, `onPressed`),
 * tgiann-radialmenu (`canInteract(args)`, `onSelect(args)`, `shouldClose`, `menu`, `event` + `type`, `command`,
 * `export`, label per language) and qb-radialmenu (`title`, `action`, `type` + `event`, `shouldClose`).
 */
export function toItem(v: unknown, depth = 0): Item | null {
  if (!isRecord(v) || depth > 4) return null;
  const id =
    str(v.id, 64) ?? (typeof v.id === "number" ? String(v.id) : undefined);
  const text = label(v.label) ?? label(v.title);
  if (!id || !text) return null;
  const check = typeof v.canShow === "function" ? v.canShow : v.canInteract;
  const items = Array.isArray(v.items)
    ? v.items
        .map((c) => toItem(c, depth + 1))
        .filter((c): c is Item => c !== null)
    : undefined;
  return {
    id,
    label: text,
    icon: iconName(v.icon),
    items: items?.length ? items : undefined,
    menu: str(v.menu, 64),
    canShow:
      typeof check === "function"
        ? () => (check as (a?: unknown) => unknown)(v.args) === true
        : undefined,
    onPressed: actionOf(v, id),
    keepOpen: v.keepOpen === true || v.shouldClose === false || undefined,
    whileDead: v.whileDead === true || undefined,
  };
}

/** One item or an array of them (tgiann-radialmenu's `AddMenuItem` takes both). */
export function toItems(v: unknown): Item[] {
  const list = Array.isArray(v) ? v : [v];
  return list.map((i) => toItem(i)).filter((i): i is Item => i !== null);
}
