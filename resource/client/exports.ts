import { provideExport, registerExport } from "@aicore-fivem/lib/client";
import { isRecord } from "@aicore-fivem/lib/shared";
import { iconName, toItem, toItems } from "./compat";
import type { ItemState, MenuRegistry } from "./registry";
import type { Wheel } from "./wheel";

type Handler = (...args: unknown[]) => unknown;
const caller = () => GetInvokingResource() ?? "";
const id = (v: unknown) => (typeof v === "string" ? v : undefined);

/**
 * Every API that adds to the wheel, into the one registry: own (`AddItem`, used by ai-core's radial layer),
 * qb-radialmenu and tgiann-radialmenu-target (both `provide`d). Items go when the calling resource stops.
 */
export function registerExports(registry: MenuRegistry, wheel: Wheel): void {
  const changed = <T>(result: T): T => {
    wheel.refresh();
    return result;
  };

  const own: Record<string, Handler> = {
    AddItem: (data) => {
      const item = toItem(data);
      if (!item) return;
      registry.add(
        item,
        caller(),
        isRecord(data) ? id(data.parent) : undefined,
      );
      wheel.refresh();
    },
    RemoveItem: (item, parent) =>
      typeof item === "string" && changed(registry.remove(item, id(parent))),
    Refresh: () => wheel.refresh(),
  };

  let optionCount = 0;
  const qb: Record<string, Handler> = {
    /** Returns the id it is kept under (the given one, else a number). */
    AddOption: (data, key) => {
      const menuId =
        typeof key === "string" || typeof key === "number"
          ? key
          : ++optionCount;
      const item = toItem(
        isRecord(data) ? { ...data, id: String(menuId) } : null,
      );
      if (item) changed(registry.add(item, caller()));
      return menuId;
    },
    RemoveOption: (key) =>
      (typeof key === "string" || typeof key === "number") &&
      changed(registry.remove(String(key))),
  };

  const tgiann: Record<string, Handler> = {
    AddMenuItem: (items, parent) => {
      const list = toItems(items);
      for (const item of list) registry.add(item, caller(), id(parent));
      return changed(list.length > 0);
    },
    RemoveMenuItem: (item, parent) =>
      typeof item === "string" && changed(registry.remove(item, id(parent))),
    /** Only the calling resource's items (tgiann clears everyone's). */
    ClearMenuItems: () => changed(registry.dropOwner(caller())),
    RegisterSubMenu: (menu) => {
      if (!isRecord(menu) || typeof menu.id !== "string") return false;
      registry.registerSubMenu(menu.id, toItems(menu.items), caller());
      return changed(true);
    },
    RefreshMenu: () => wheel.refresh(),
    DisableMenu: (state) => wheel.setDisabled(state === true),
    IsMenuDisabled: () => wheel.disabled,
    OpenMenu: () => wheel.show(),
    CloseMenu: () => wheel.close(),
    IsMenuOpen: () => wheel.isOpen,
    HasMenuItem: (item) => typeof item === "string" && registry.has(item),
    SetMenuItemHidden: (item, state) =>
      typeof item === "string" &&
      changed(registry.setState(item, { hidden: state === true }, caller())),
    IsMenuItemHidden: (item) =>
      typeof item === "string" && registry.state(item)?.hidden === true,
    UpdateMenuItem: (item, data) => {
      if (typeof item !== "string" || !isRecord(data)) return;
      const patch: ItemState = {};
      const label = toItem({ id: item, label: data.label })?.label;
      if (label) patch.label = label;
      if (data.icon != null) patch.icon = iconName(data.icon);
      changed(registry.setState(item, patch, caller()));
    },
    ResetMenuItem: (item) =>
      typeof item === "string" && changed(registry.resetState(item)),
  };

  for (const [name, fn] of Object.entries(own)) registerExport(name, fn);
  for (const [name, fn] of Object.entries(qb)) {
    registerExport(name, fn);
    provideExport("qb-radialmenu", name, fn);
  }
  for (const [name, fn] of Object.entries(tgiann))
    provideExport("tgiann-radialmenu-target", name, fn);
}
