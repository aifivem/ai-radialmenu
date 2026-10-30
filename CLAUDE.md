# ai-radialmenu

The radial wheel (F1): built-in items (inventory, vehicle engine / trunk / hood while driving) and items other resources add; one level of sub wheels. Client only. Stands in for `qb-radialmenu`'s `AddOption` / `RemoveOption`.

## Decisions

- Items added by a resource keep its function reference and go away when that resource stops; ai-police adds its job menu while both run.
- At most 12 slices at a level; items with a `when` show only when it holds (vehicle items).
- No panel: nothing for an owner to tune (the key is rebindable in GTA's settings).

## Contracts

- Client exports `AddItem({ id, label, icon, onSelect })`, `RemoveItem(id)` (typed `AiRadialClientExports`); `qb-radialmenu` `AddOption(data, id)` / `RemoveOption(id)` (`event` names are emitted locally).

## Entry points

- Client: `resource/client/index.ts`. NUI: `web/src/App.tsx` (`bun run webdev`).
