# ai-radialmenu

The radial wheel (F3 by default), modelled on tgiann-radialmenu-target's "circle" style: built-in items (inventory, HUD settings, keys screen, vehicle category with engine / trunk / hood) and items other resources add, with per-item conditions and nested sub menus. Client only. ai-core's radial layer forwards lib `radial` items here; it also answers `qb-radialmenu` and `tgiann-radialmenu-target` (`docs/compat/radial.md`).

## Decisions

- One registry for everything on the wheel (`client/registry.ts`): built-ins, ai-core's forwarded items and every compatibility API go in as one `Item` shape (`client/compat.ts` reads each API's field names); items sit under a parent id in add order, adding an id again under the same parent replaces it, and a stopped resource's items, sub menus and item states go.
- Items are tgiann-radialmenu's model: `canShow` (read on open and on refresh; a throw hides the item), `onPressed`, static `items`, `menu` (a registered sub menu), dynamic children by parent id, `keepOpen` (stays open and refreshes), `whileDead` (while downed only these show; the wheel does not open when none). A category without a visible sub item is hidden. A pick re-checks `canShow` and refuses with a notification when it no longer holds.
- NUI keys are id paths (`vehicle/engine`), so a refresh (`update` message, the whole visible tree) keeps the player on the level they are on while it still exists.
- Feel taken from tgiann: pages of 10 cards (1-9, 0 pick; arrows, scroll or the pager turn), Backspace or right click goes back, the centre button goes back or closes, hovering a category shows its sub items as icon squares around the card (`web/src/lib/subSlots.ts`), level and page changes animate by direction (`web/src/lib/motion.ts`). Escape closes on key up; the open key closes on a fresh press; a click outside the cards closes.
- Icons: the whole Font Awesome solid set by name and alias (items come from any script), `fas fa-x` names cut down to `x` on the client, image urls drawn as pictures.
- Toggle key only (no hold mode, no player settings panel): nothing for an owner to tune (the key is rebindable in GTA's settings and ai-core's panel).

## Contracts

- Own client exports `AddItem(RadialItem)` (`onSelect` accepted as `onPressed`), `RemoveItem(id, parent?)`, `Refresh()` (typed `AiRadialClientExports`); ai-* scripts never call them, they use lib `radial`.
- `provide`s `qb-radialmenu` (`AddOption` / `RemoveOption`) and `tgiann-radialmenu-target` (its client menu exports); list and limits in `docs/compat/radial.md`.
- NUI contract `resource/common/radial.ts`: `open { items, texts, key }`, `update { items }`, `close`; callbacks `select { key }`, `close`.

## Entry points

- Client: `resource/client/index.ts` (keybind, NUI callbacks), `wheel.ts` (open wheel, tree build, picks), `builtins.ts`, `exports.ts`.
- NUI: `web/src/components/Wheel.tsx`, store `web/src/features/wheel.ts`; browser preview `bun run webdev` (mock: 12 items, a vehicle and a nested police category).
