import { cache, inventory, resourceExport } from "@aicore-fivem/lib/client";
import { RADIAL_VEHICLE } from "@aicore-fivem/shared";
import { Locale, ResourceName } from "common";
import type { Item, MenuRegistry } from "./registry";

const core = resourceExport("ai-core");

const driving = () => cache.vehicle !== false && cache.seat === -1;
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
    onPressed: () =>
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
