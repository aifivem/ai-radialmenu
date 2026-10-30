import type { NuiMessage } from "../../../resource/common/radial";

type OpenData = Extract<NuiMessage, { action: "open" }>["data"];

const leaf = (key: string, label: string, icon: string) => ({
  key,
  label,
  icon,
});

/** Browser preview only (`bun run webdev`): 12 items (two pages), a vehicle category, a police category with a sub level. */
export const MOCK_OPEN: OpenData = {
  key: "F3",
  texts: {
    title: "Radial menu",
    back: "Back",
    close: "Close",
    page: "Page {0} / {1}",
    prev: "Previous page",
    next: "Next page",
  },
  items: [
    leaf("inventory", "Inventory", "box-open"),
    leaf("hud", "HUD settings", "sliders"),
    leaf("keys", "Keys", "keyboard"),
    {
      key: "vehicle",
      label: "Vehicle",
      icon: "car",
      items: [
        leaf("vehicle/engine", "Engine on / off", "key"),
        leaf("vehicle/trunk", "Trunk", "car-rear"),
        leaf("vehicle/hood", "Hood", "car-side"),
        leaf(
          "vehicle/givekeys",
          "Give the keys to the nearest player",
          "hand-holding",
        ),
      ],
    },
    {
      key: "police",
      label: "Police menu",
      icon: "id-card",
      items: [
        leaf("police/cuff", "Cuff", "user-lock"),
        leaf("police/escort", "Escort", "user-group"),
        {
          key: "police/objects",
          label: "Objects",
          icon: "road",
          items: [
            leaf("police/objects/cone", "Cone", "triangle-exclamation"),
            leaf("police/objects/barrier", "Barrier", "torii-gate"),
          ],
        },
      ],
    },
    leaf("carry", "Carry", "people-carry-box"),
    leaf("drugs", "Sell drugs", "cannabis"),
    leaf("phone", "Give contact details", "address-book"),
    leaf("house", "House keys", "house"),
    leaf("emotes", "Emotes", "face-smile"),
    leaf("clothes", "Clothing", "shirt"),
    leaf("walk", "Walk style", "person-walking"),
  ],
};
