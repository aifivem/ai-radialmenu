import {
  cache,
  inventory,
  Keybind,
  provideExport,
  registerExport,
} from "@aicore-fivem/lib/client";
import { Locale } from "common";
import type { NuiMessage, RadialView } from "common/radial";

const send = (m: NuiMessage): void => SendNUIMessage(m);
const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

/** An item: built in (here) or added by a resource (its function runs in that resource; removed when it stops). */
interface Item {
  id: string;
  label: string;
  icon: string;
  resource: string;
  /** Shown only when this returns true (vehicle items in a vehicle...). */
  when?: () => boolean;
  onSelect?: () => void;
  children?: Item[];
}

const inVehicle = () => cache.vehicle !== false && cache.seat === -1;
const toggleDoor = (door: number) => {
  if (cache.vehicle === false) return;
  if (GetVehicleDoorAngleRatio(cache.vehicle, door) > 0.1)
    SetVehicleDoorShut(cache.vehicle, door, false);
  else SetVehicleDoorOpen(cache.vehicle, door, false, false);
};

/** The wheel: built-in items first, then what resources added; one level of sub wheels. */
class Radial {
  private readonly items = new Map<string, Item>();
  private open = false;
  private closedAt = 0;

  constructor() {
    const own = GetCurrentResourceName();
    this.add({
      id: "inventory",
      label: Locale("RADIAL_INVENTORY"),
      icon: "box-open",
      resource: own,
      onSelect: () => inventory.openInventory(),
    });
    this.add({
      id: "vehicle",
      label: Locale("RADIAL_VEHICLE"),
      icon: "car",
      resource: own,
      when: inVehicle,
      children: [
        {
          id: "engine",
          label: Locale("RADIAL_ENGINE"),
          icon: "key",
          resource: own,
          onSelect: () =>
            cache.vehicle !== false &&
            SetVehicleEngineOn(
              cache.vehicle,
              !GetIsVehicleEngineRunning(cache.vehicle),
              false,
              true,
            ),
        },
        {
          id: "trunk",
          label: Locale("RADIAL_TRUNK"),
          icon: "car-rear",
          resource: own,
          onSelect: () => toggleDoor(5),
        },
        {
          id: "hood",
          label: Locale("RADIAL_HOOD"),
          icon: "car-side",
          resource: own,
          onSelect: () => toggleDoor(4),
        },
      ],
    });
  }

  add(item: Item): void {
    this.items.set(item.id, item);
  }

  remove(id: string): void {
    this.items.delete(id);
  }

  dropResource(resource: string): void {
    for (const item of this.items.values())
      if (item.resource === resource) this.items.delete(item.id);
  }

  private visible(list: Iterable<Item>): Item[] {
    return [...list].filter((i) => !i.when || i.when());
  }

  private view(item: Item): RadialView {
    return {
      id: item.id,
      label: item.label,
      icon: item.icon,
      children: item.children
        ? this.visible(item.children).map((c) => this.view(c))
        : undefined,
    };
  }

  show(): void {
    // The key that closed the wheel in the NUI is still down when the game gets the focus back: no instant reopen.
    if (
      this.open ||
      GetGameTimer() - this.closedAt < 300 ||
      IsPauseMenuActive() ||
      IsNuiFocused() ||
      IsEntityDead(cache.ped)
    )
      return;
    const items = this.visible(this.items.values()).slice(0, 12);
    if (items.length === 0) return;
    this.open = true;
    SetNuiFocus(true, true);
    SetCursorLocation(0.5, 0.5);
    send({
      action: "open",
      data: {
        items: items.map((i) => this.view(i)),
        back: Locale("RADIAL_BACK"),
      },
    });
  }

  close(): void {
    if (!this.open) return;
    this.open = false;
    this.closedAt = GetGameTimer();
    SetNuiFocus(false, false);
    send({ action: "close", data: null });
  }

  select(path: string[]): void {
    let list = [...this.items.values()];
    let item: Item | undefined;
    for (const id of path) {
      item = list.find((i) => i.id === id);
      list = item?.children ?? [];
    }
    this.close();
    item?.onSelect?.();
  }
}

const radial = new Radial();
new Keybind({
  name: "radialmenu_open",
  description: Locale("KEYBIND_OPEN"),
  defaultKey: "F1",
  onPressed: () => radial.show(),
});

type Reply = (r: unknown) => void;
RegisterNuiCallback("select", (d: unknown, cb: Reply) => {
  if (isObj(d) && Array.isArray(d.path))
    radial.select(d.path.filter((p): p is string => typeof p === "string"));
  cb(true);
});
RegisterNuiCallback("close", (_d: unknown, cb: Reply) => {
  radial.close();
  cb(true);
});
on("onClientResourceStop", (resource: string) => radial.dropResource(resource));

/** Items other resources add: `AddItem({ id, label, icon, onSelect })` (own) and qb-radialmenu's `AddOption` / `RemoveOption`. */
function toItem(v: unknown, resource: string): Item | null {
  if (!isObj(v) || typeof v.id !== "string" || typeof v.label !== "string")
    return null;
  const onSelect =
    typeof v.onSelect === "function"
      ? (v.onSelect as () => void)
      : typeof v.event === "string"
        ? () => emit(String(v.event))
        : undefined;
  return {
    id: v.id,
    label: v.label.slice(0, 40),
    icon:
      typeof v.icon === "string"
        ? v.icon.replace(/^fa[srb]?-|^fa-solid fa-/, "")
        : "circle-dot",
    resource,
    onSelect,
  };
}
let optionId = 0;
const api: Record<string, (...args: unknown[]) => unknown> = {
  AddItem: (data) => {
    const item = toItem(data, GetInvokingResource() ?? "");
    if (item) radial.add(item);
  },
  RemoveItem: (id) => typeof id === "string" && radial.remove(id),
  AddOption: (data, id) => {
    const key = typeof id === "string" ? id : `qb-${++optionId}`;
    const raw = isObj(data)
      ? { ...data, id: key, label: data.title ?? data.label }
      : null;
    const item = toItem(raw, GetInvokingResource() ?? "");
    if (item) radial.add(item);
    return key;
  },
  RemoveOption: (id) => typeof id === "string" && radial.remove(id),
};
for (const [name, fn] of Object.entries(api)) {
  registerExport(name, fn);
  provideExport("qb-radialmenu", name, fn);
}
