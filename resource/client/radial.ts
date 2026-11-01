import { Keybind } from "@aicore-fivem/lib/client";
import { isRecord } from "@aicore-fivem/lib/shared";
import { Locale, ResourceName } from "common";
import { NUI } from "common/radial";
import { addBuiltins } from "./builtins";
import { registerExports } from "./exports";
import { MenuRegistry } from "./registry";
import { Wheel } from "./wheel";
import { NUI_LAYER } from "@aicore-fivem/shared";

// Stacking among NUI pages (`NUI_LAYER`): set at start, not left to load order.
SetNuiZindex(NUI_LAYER.radial);

const registry = new MenuRegistry();
addBuiltins(registry);

const openKey = new Keybind({
  name: "radialmenu_open",
  description: Locale("KEYBIND_OPEN"),
  defaultKey: "F3",
  hint: "always",
  icon: "circle-nodes",
  hintLabel: Locale("HINT_RADIAL"),
  onPressed: () => wheel.show(),
});
const wheel = new Wheel(registry, () => openKey.currentKey);
registerExports(registry, wheel);

type Reply = (r: unknown) => void;
RegisterNuiCallback(NUI.select, (d: unknown, cb: Reply) => {
  cb(true);
  if (isRecord(d) && typeof d.key === "string") wheel.select(d.key);
});
RegisterNuiCallback(NUI.close, (_d: unknown, cb: Reply) => {
  cb(true);
  wheel.close();
});

on("onClientResourceStop", (resource: string) => {
  if (resource === ResourceName) return wheel.close();
  if (registry.dropOwner(resource)) wheel.refresh();
});
