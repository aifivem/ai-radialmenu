/** Browser preview only (`bun run webdev`): the wheel with a vehicle sub wheel and a police item. */
export const MOCK_OPEN = {
  back: "Back",
  key: "F3",
  items: [
    { id: "inventory", label: "Inventory", icon: "box-open" },
    {
      id: "vehicle",
      label: "Vehicle",
      icon: "car",
      children: [
        { id: "engine", label: "Engine", icon: "key" },
        { id: "trunk", label: "Trunk", icon: "car-rear" },
        { id: "hood", label: "Hood", icon: "car-side" },
      ],
    },
    { id: "police", label: "Police menu", icon: "id-card" },
    { id: "lock", label: "Lock vehicle", icon: "lock" },
  ],
};
