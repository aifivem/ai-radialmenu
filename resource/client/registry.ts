/** A wheel item after any API's fields were read into one shape (`compat.ts`). */
export interface Item {
  id: string;
  label: string;
  icon: string;
  /** Static sub items: the card opens a sub wheel. */
  items?: Item[];
  /** A sub menu registered by id (`RegisterSubMenu`): opens like `items`. */
  menu?: string;
  canShow?: () => boolean;
  onPressed?: () => void;
  keepOpen?: boolean;
  whileDead?: boolean;
}

/** A change other resources make to any item by id (tgiann-radialmenu's `SetMenuItemHidden` / `UpdateMenuItem`). */
export interface ItemState {
  hidden?: boolean;
  label?: string;
  icon?: string;
}

interface Entry {
  item: Item;
  owner: string;
}

const ROOT = "";

/**
 * Every item of the wheel, whatever API added it: built-ins, ai-core's radial layer (lib `radial`), qb-radialmenu and
 * tgiann-radialmenu calls. Items sit under a parent id (ROOT = the main wheel) in add order; a stopped owner's items,
 * sub menus and states go.
 */
export class MenuRegistry {
  private readonly children = new Map<string, Entry[]>();
  private readonly subMenus = new Map<string, Entry[]>();
  private readonly states = new Map<string, ItemState & { owner: string }>();

  /** Adds or replaces (same id under the same parent). */
  add(item: Item, owner: string, parent = ROOT): void {
    const list = this.children.get(parent) ?? [];
    this.children.set(parent, list);
    const at = list.findIndex((e) => e.item.id === item.id);
    if (at >= 0) list[at] = { item, owner };
    else list.push({ item, owner });
  }

  remove(id: string, parent = ROOT): boolean {
    const list = this.children.get(parent);
    const at = list?.findIndex((e) => e.item.id === id) ?? -1;
    if (!list || at < 0) return false;
    list.splice(at, 1);
    return true;
  }

  childrenOf(parent = ROOT): Item[] {
    return (this.children.get(parent) ?? []).map((e) => e.item);
  }

  registerSubMenu(id: string, items: Item[], owner: string): void {
    this.subMenus.set(
      id,
      items.map((item) => ({ item, owner })),
    );
  }

  subMenu(id: string): Item[] | undefined {
    return this.subMenus.get(id)?.map((e) => e.item);
  }

  /** Whether any item (added, built in or in a sub menu) has this id. */
  has(id: string): boolean {
    const inList = (items: Item[] | undefined): boolean =>
      !!items?.some((i) => i.id === id || inList(i.items));
    for (const list of [...this.children.values(), ...this.subMenus.values()])
      if (inList(list.map((e) => e.item))) return true;
    return false;
  }

  setState(id: string, patch: ItemState, owner: string): void {
    this.states.set(id, { ...this.states.get(id), ...patch, owner });
  }

  state(id: string): ItemState | undefined {
    return this.states.get(id);
  }

  resetState(id: string): boolean {
    return this.states.delete(id);
  }

  /** Removes every item of one owner (ClearMenuItems of that resource, or the resource stopped). */
  dropOwner(owner: string): boolean {
    let changed = false;
    for (const list of this.children.values())
      for (let i = list.length - 1; i >= 0; i--)
        if (list[i]?.owner === owner) {
          list.splice(i, 1);
          changed = true;
        }
    for (const [id, list] of this.subMenus)
      if (list[0]?.owner === owner) changed = this.subMenus.delete(id);
    for (const [id, state] of this.states)
      if (state.owner === owner) changed = this.states.delete(id);
    return changed;
  }
}
