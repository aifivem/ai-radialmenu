import {
  cache,
  drivenVehicle,
  inventory,
  notify,
  resourceExport,
} from "@aicore-fivem/lib/client";
import { RADIAL_VEHICLE } from "@aicore-fivem/shared";
import { Locale, ResourceName } from "common";
import type { Item, MenuRegistry } from "./registry";

const core = resourceExport("ai-core");

const driving = () => drivenVehicle() !== false;
/** GTA's "this ped cannot start an engine" flag: key systems (ai-vehiclekeys) set it while the driver has no key. */
const NO_ENGINE_START = 429;

/** Engine off always; on only when nothing holds the engine off (no key: the key system's flag). */
function toggleEngine(): void {
  const vehicle = cache.vehicle;
  if (vehicle === false) return;
  const running = GetIsVehicleEngineRunning(vehicle);
  if (!running && GetPedConfigFlag(cache.ped, NO_ENGINE_START, true))
    return notify(Locale("RADIAL_ERR_NO_KEY"), "error", 2500);
  SetVehicleEngineOn(vehicle, !running, false, true);
}
const toggleDoor = (door: number) => {
  if (cache.vehicle === false) return;
  if (GetVehicleDoorAngleRatio(cache.vehicle, door) > 0.1)
    SetVehicleDoorShut(cache.vehicle, door, false);
  else SetVehicleDoorOpen(cache.vehicle, door, false, false);
};

/** The vehicle category's own items; other resources add theirs with `parent: RADIAL_VEHICLE` (ai-vehiclekeys). */
const vehicleItems: Item[] = [
  {
    id: "engine",
    label: Locale("RADIAL_ENGINE"),
    icon: "key",
    canShow: driving,
    onPressed: toggleEngine,
  },
  {
    id: "trunk",
    label: Locale("RADIAL_TRUNK"),
    icon: "car-rear",
    canShow: driving,
    keepOpen: true,
    onPressed: () => toggleDoor(5),
  },
  {
    id: "hood",
    label: Locale("RADIAL_HOOD"),
    icon: "car-side",
    canShow: driving,
    keepOpen: true,
    onPressed: () => toggleDoor(4),
  },
];

/** Built-in items, in the registry like any other (owner: this resource). */
export function addBuiltins(registry: MenuRegistry): void {
  const items: Item[] = [
    {
      id: "inventory",
      label: Locale("RADIAL_INVENTORY"),
      icon: "box-open",
      onPressed: () => inventory.openInventory(),
    },
    {
      id: "hud",
      label: Locale("RADIAL_HUD"),
      icon: "sliders",
      // Whatever HUD runs (ai-hud, tgiann-lumihud) opens its own settings through ai-core.
      canShow: () => core.HasHudSettings(),
      onPressed: () => void core.OpenHudSettings(),
    },
    {
      id: "keys",
      label: Locale("RADIAL_KEYS"),
      icon: "keyboard",
      // ai-core's keys screen: every key that does something, on a keyboard.
      onPressed: () => core.OpenKeyboard(),
    },
    {
      id: RADIAL_VEHICLE,
      label: Locale("RADIAL_VEHICLE"),
      icon: "car",
      canShow: () => cache.vehicle !== false,
      items: vehicleItems,
    },
  ];
  for (const item of items) registry.add(item, ResourceName);
}
