import { medical, notify } from "@aicore-fivem/lib/client";
import { createLogger } from "@aicore-fivem/lib/shared";
import { Locale } from "common";
import type { NuiMessage, RadialNode, RadialTexts } from "common/radial";
import type { Item, MenuRegistry } from "./registry";

const log = createLogger("ai-radialmenu");
const send = (m: NuiMessage): void => SendNUIMessage(m);

/** The open wheel: builds the visible tree from the registry, runs picks, keeps an open level on refresh. */
export class Wheel {
  isOpen = false;
  disabled = false;
  private closedAt = 0;
  /** NUI key -> item of the last build (categories included). */
  private readonly byKey = new Map<string, Item>();
  /** Item ids on the path being built: an item that is its own parent or ancestor is skipped (no endless tree). */
  private readonly path = new Set<string>();

  constructor(
    private readonly registry: MenuRegistry,
    private readonly openKey: () => string,
  ) {}

  private dead(): boolean {
    return medical.isDead();
  }

  /** Hidden by a state, or its condition fails (a condition that throws hides the item). */
  private visible(item: Item): boolean {
    if (this.registry.state(item.id)?.hidden) return false;
    if (!item.canShow) return true;
    try {
      return item.canShow() === true;
    } catch (error) {
      log.error(`canShow of radial item ${item.id} failed`, error);
      return false;
    }
  }

  /** A card, or null when hidden; a category without a visible sub item is hidden too. */
  private node(item: Item, key: string): RadialNode | null {
    if (this.path.has(item.id) || !this.visible(item)) return null;
    const state = this.registry.state(item.id);
    const node: RadialNode = {
      key,
      label: state?.label ?? item.label,
      icon: state?.icon ?? item.icon,
    };
    this.byKey.set(key, item);
    const sub = item.items ?? (item.menu && this.registry.subMenu(item.menu));
    const added = this.registry.childrenOf(item.id);
    if (!sub && added.length === 0) return item.menu ? null : node;
    this.path.add(item.id);
    const items = this.level([...(sub || []), ...added], `${key}/`);
    this.path.delete(item.id);
    if (items.length === 0) return null;
    node.items = items;
    return node;
  }

  private level(list: Item[], prefix: string, dead = false): RadialNode[] {
    const seen = new Set<string>();
    const out: RadialNode[] = [];
    for (const item of list) {
      if (seen.has(item.id) || (dead && !item.whileDead)) continue;
      seen.add(item.id);
      const node = this.node(item, prefix + item.id);
      if (node) out.push(node);
    }
    return out;
  }

  private tree(): RadialNode[] {
    this.byKey.clear();
    this.path.clear();
    return this.level(this.registry.childrenOf(), "", this.dead());
  }

  show(): void {
    // The key that closed the wheel in the NUI is still down when the game gets the focus back: no instant reopen.
    if (
      this.disabled ||
      this.isOpen ||
      GetGameTimer() - this.closedAt < 300 ||
      IsPauseMenuActive() ||
      IsNuiFocused()
    )
      return;
    const items = this.tree();
    if (items.length === 0) return;
    this.isOpen = true;
    SetNuiFocus(true, true);
    SetCursorLocation(0.5, 0.5);
    send({
      action: "open",
      data: { items, texts: texts(), key: this.openKey().toUpperCase() },
    });
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.closedAt = GetGameTimer();
    SetNuiFocus(false, false);
    send({ action: "close", data: null });
  }

  /** Sends the items again to an open wheel (conditions read anew). */
  refresh(): void {
    if (this.isOpen) send({ action: "update", data: { items: this.tree() } });
  }

  setDisabled(state: boolean): void {
    this.disabled = state;
    if (state) this.close();
  }

  select(key: string): void {
    const item = this.byKey.get(key);
    if (!item) return;
    // The condition may have changed while the wheel was open.
    if (!this.visible(item)) {
      this.close();
      return notify(Locale("RADIAL_UNAVAILABLE"), "error", 2500);
    }
    if (!item.keepOpen) this.close();
    try {
      item.onPressed?.();
    } catch (error) {
      log.error(`radial item ${item.id} failed`, error);
    }
    if (item.keepOpen) this.refresh();
  }
}

const texts = (): RadialTexts => ({
  title: Locale("RADIAL_TITLE"),
  back: Locale("RADIAL_BACK"),
  close: Locale("RADIAL_CLOSE"),
  page: Locale("RADIAL_PAGE"),
  prev: Locale("RADIAL_PREV_PAGE"),
  next: Locale("RADIAL_NEXT_PAGE"),
});
