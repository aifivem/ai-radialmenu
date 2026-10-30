/*aicore-client-errors*/(function(){var n=GetCurrentResourceName(),s={},c=0;var r=function(t){t=String(t).replace(/\^\d/g,"");var k=t.slice(0,300);if(s[k]||c>=20)return;s[k]=1;c++;try{TriggerServerEvent("ai-core:clientError",n,t.slice(0,4000))}catch(e){}};globalThis.__aicoreReportError=r;var l=console.log;console.log=function(){var a=arguments[0];if(typeof a==="string"&&a.indexOf("SCRIPT ERROR")!==-1)r(a);return l.apply(console,arguments)}})();
try{
(function() {

// ../../../packages/lib/src/fivem/callbackNames.ts
	const responseEvent = (resource) => `aicore:cbr:${resource}`;

// ../../../packages/lib/src/shared/index.ts
	function isRecord(value) {
		return typeof value === "object" && value !== null && !Array.isArray(value);
	}
	/** Fills `{0}`, `{1}`... with the arguments by position (a translation may reorder or repeat them). */
	function formatText(template, args) {
		return template.replace(/\{(\d+)\}/g, (match, index) => {
			const value = args[Number(index)];
			return value === void 0 ? match : String(value);
		});
	}
	/** Console output prefixed with the resource name, so server logs show where a line came from. */
	function createLogger(resource) {
		const prefix = `[${resource}]`;
		return {
			info: (message, ...details) => console.log(`${prefix} ${message}`, ...details),
			warn: (message, ...details) => console.warn(`${prefix} ^3${message}^7`, ...details),
			error: (message, ...details) => console.error(`${prefix} ^1${message}^7`, ...details)
		};
	}

// ../../../packages/lib/src/client/netEvent.ts
	const log$2 = createLogger(GetCurrentResourceName());
	/**
	* Whether the net event being handled came from the server (read it before the first `await`). On a client only
	* events from the server carry a source (65535 in the docs); a local emit by any resource carries none.
	*/
	const fromServer = () => Boolean(globalThis.source);

// ../../../packages/lib/src/client/callback.ts
	const resource$1 = GetCurrentResourceName();
	const log$1 = createLogger(resource$1);
	const pending = /* @__PURE__ */ new Map();
	onNet(responseEvent(resource$1), (id, ok, result) => {
		if (!fromServer()) return;
		const entry = typeof id === "number" ? pending.get(id) : void 0;
		if (!entry) return;
		pending.delete(id);
		clearTimeout(entry.timer);
		if (ok === true) entry.resolve(result);
		else entry.reject(/* @__PURE__ */ new Error("server callback failed"));
	});

// ../../../packages/shared/src/core.ts
/** Names owned by ai-core that other resources, the bridges and the build step use. */
	const CORE = {
		resource: "ai-core",
		/** Client -> server: (resource: string, text: string). Sent by the reporter every client bundle carries. */
		clientErrorEvent: "ai-core:clientError",
		/** (src, character: CharacterInfo) after a character is loaded and spawned. */
		playerLoadedEvent: "ai-core:playerLoaded",
		/** (src, charId, reason: UnloadReason) before a character's state is dropped. */
		playerUnloadedEvent: "ai-core:playerUnloaded",
		/** (src, account: string, balance: number, delta: number, reason: string) */
		moneyChangedEvent: "ai-core:moneyChanged",
		/** (src, jobs: JobMembership[]) */
		jobsChangedEvent: "ai-core:jobsChanged",
		/** (src, job: string | null) */
		dutyChangedEvent: "ai-core:dutyChanged",
		/** (src, gangs: GangMembership[]) */
		gangsChangedEvent: "ai-core:gangsChanged",
		/** (src, gang: string | null) */
		activeGangChangedEvent: "ai-core:activeGangChanged",
		/** (src, charIds: number[]) each time a player's character screen loads; an appearance resource answers with portraits. */
		characterScreenEvent: "ai-core:characterScreen",
		/** (resource: string | null) the inventory behind ai-core's inventory layer changed (the bridge drops its item cache). */
		inventoryChangedEvent: "ai-core:inventoryChanged",
		/** (src, name: string, status: Record<string, number> | null) a player used an item; status = the needs it gives, from inventories that define them. */
		itemUsedEvent: "ai-core:itemUsed",
		/** (src, killer: number | null, weaponHash: number) a player with a loaded character died; fired from FXServer's `onPedDeath` (needs `PED_DEATH_STATE_KEY`). */
		playerDiedEvent: "ai-core:playerDied",
		clientPlayerLoadedEvent: "ai-core:client:playerLoaded",
		clientPlayerUnloadedEvent: "ai-core:client:playerUnloaded",
		/** (charId: number, url: string) a portrait image of a character on the character screen (e.g. `https://nui-img/<txd>/<txd>`). */
		clientCharacterPortraitEvent: "ai-core:client:characterPortrait",
		/** (charId: number) ai-appearance holds this character's look: ai-core dresses its scene ped with `ApplyCharacterAppearance`. */
		clientCharacterLookEvent: "ai-core:client:characterLook",
		/** (resource: string, id: string) the interaction key was pressed while that resource's prompt was on top. */
		clientPromptPressedEvent: "ai-core:client:promptPressed",
		/** (key: keyof PlayerCache, value) a cached value of the local player changed (one watcher in ai-core for every resource). */
		clientCacheEvent: "ai-core:client:cache",
		charactersCallback: "ai-core:characters",
		createCharacterCallback: "ai-core:createCharacter",
		deleteCharacterCallback: "ai-core:deleteCharacter",
		selectCharacterCallback: "ai-core:selectCharacter",
		/** Server -> client: (notification: Notification) a notification card on the player's screen. */
		clientNotifyEvent: "ai-core:client:notify",
		/** Server -> client: (spawn: SpawnPoint) puts the loaded character into the world. */
		spawnEvent: "ai-core:client:spawn",
		/** Server -> client: () the character was let go (switch); show the character screen again. */
		openCharactersEvent: "ai-core:client:openCharacters"
	};

// ../../../packages/shared/src/menu.ts
	const MENU_EVENTS = {
		/** Client local: (resource, requestId, itemId | null) the player picked an item or closed the menu. */
		menuResult: "ai-core:client:menuResult",
		/** Client local: (resource, requestId, itemId) the pointer or focus is on an item (previews). */
		menuHover: "ai-core:client:menuHover",
		/** Client local: (resource, requestId, values | null) the player confirmed or closed the input dialog. */
		inputResult: "ai-core:client:inputResult"
	};

// ../../../packages/shared/src/commands.ts
/** Client local events between the lib's `Keybind` and ai-core's client. */
	const KEYBIND = {
		/** lib -> ai-core: (info: KeybindInfo) a keybind waits for its default key. */
		announceEvent: "ai-core:client:keybind",
		/** ai-core -> lib: (resource, name, key) the default key to register: the panel's value, else the script's. */
		keyEvent: "ai-core:client:keybindKey"
	};

// ../../../packages/lib/src/client/cache.ts
/** The unarmed "weapon" hash: cached as `false`. */
	const UNARMED = GetHashKey("WEAPON_UNARMED") | 0;
	/** The vehicle, seat and weapon of a ped right now (also ai-core's watcher). */
	function readPlayerState(ped) {
		const vehicle = GetVehiclePedIsIn(ped, false);
		let seat = false;
		if (vehicle) for (let i = -1; i < GetVehicleMaxNumberOfPassengers(vehicle); i++) {
			if (GetPedInVehicleSeat(vehicle, i) !== ped) continue;
			seat = i;
			break;
		}
		const weapon = GetSelectedPedWeapon(ped) | 0;
		return {
			vehicle: vehicle || false,
			seat,
			weapon: weapon === UNARMED ? false : weapon
		};
	}
	/**
	* The local player's often read values (ped, player id, server id, vehicle, seat, weapon), like ox_lib's `cache`:
	* read `cache.ped` instead of calling PlayerPedId() in loops. One watcher in ai-core updates every resource through
	* a local event, so no resource polls for these itself. Read only.
	*/
	const ped = PlayerPedId();
	const cache = {
		ped,
		playerId: PlayerId(),
		serverId: GetPlayerServerId(PlayerId()),
		...readPlayerState(ped)
	};
	const handlers = /* @__PURE__ */ new Map();
	const valid = (key, value) => key === "ped" || key === "playerId" || key === "serverId" ? typeof value === "number" : typeof value === "number" || value === false;
	on(CORE.clientCacheEvent, (key, value) => {
		if (typeof key !== "string" || !(key in cache)) return;
		const name = key;
		if (!valid(name, value) || cache[name] === value) return;
		const old = cache[name];
		cache[name] = value;
		for (const handler of handlers.get(name) ?? []) handler(value, old);
	});

// ../../../packages/lib/src/client/zones.ts
/**
	* Zones on this client: inside / outside checks at each zone's own interval, never per frame. Built for any count
	* (measured with 1,000,000 zones): zones sit in a grid of 64 m cells and a check looks only at the player's cell and
	* the zones the player is in.
	*/
	const log = createLogger(GetCurrentResourceName());

// ../../../packages/lib/src/fivem/exports.ts
	function registerExport(name, handler) {
		globalThis.exports(name, handler);
	}
	/** Typed access to another resource's exports (types come from CitizenExports in @aicore-fivem/shared). */
	function resourceExport(resource) {
		return globalThis.exports[resource];
	}
	/** Whether a resource is running now. */
	function isResourceStarted(resource) {
		return GetResourceState(resource) === "started";
	}
	/** Answers `exports["<resource>"].<name>` for a resource name this one `provide`s: provide makes the name exist but does not alias its exports, so each export of the stood-in resource is answered through FiveM's export event. */
	function provideExport(resource, name, fn) {
		on(`__cfx_export_${resource}_${name}`, (setCallback) => setCallback(fn));
	}

// ../../../packages/lib/src/client/menu.ts
/** Menus and input dialogs this resource asked ai-core for, waiting for the player's answer. */
	var Requests = class {
		resource = GetCurrentResourceName();
		waiting = /* @__PURE__ */ new Map();
		hovers = /* @__PURE__ */ new Map();
		nextId = 0;
		constructor() {
			const answer = (owner, id, value) => {
				if (owner !== this.resource || typeof id !== "number") return;
				this.waiting.get(id)?.(value);
				this.waiting.delete(id);
				this.hovers.delete(id);
			};
			on(MENU_EVENTS.menuHover, (owner, id, item) => {
				if (owner === this.resource && typeof id === "number" && typeof item === "string") this.hovers.get(id)?.(item);
			});
			on(MENU_EVENTS.menuResult, answer);
			on(MENU_EVENTS.inputResult, answer);
		}
		ask(open, read, onHover) {
			const id = ++this.nextId;
			this.waiting.set(id, read);
			if (onHover) this.hovers.set(id, onHover);
			open(id);
		}
	};
	const requests = new Requests();

// ../../../packages/lib/src/client/inventory.ts
	const core = () => resourceExport(CORE.resource);
	/** The local player's inventory through ai-core's inventory layer (the inventory the server picked answers). */
	const inventory = {
		/** Opens the player's own inventory screen. */
		openInventory: () => core().OpenInventory(),
		/** Whether the player holds at least `count` of an item. */
		hasItem: (item, count = 1) => core().HasItem(item, count)
	};

// ../../../packages/lib/src/client/vehicleProps.ts
	const MOD_TYPES = Array.from({ length: 50 }, (_, i) => i);

// ../../../packages/lib/src/client/keybind.ts
	const resource = GetCurrentResourceName();
	/** Keybinds of this resource waiting for ai-core's answer (the panel's default key, else their own). */
	const waiting = /* @__PURE__ */ new Map();
	let listening = false;
	/** Asks ai-core's client for the default key (it knows the panel's keybind defaults); without ai-core the script's own. */
	function requestKey(info, apply) {
		if (resource !== CORE.resource && !isResourceStarted(CORE.resource)) return apply(info.defaultKey);
		if (!listening) {
			listening = true;
			on(KEYBIND.keyEvent, (owner, name, key) => {
				if (owner !== resource || typeof name !== "string" || typeof key !== "string") return;
				const done = waiting.get(name);
				waiting.delete(name);
				done?.(key);
			});
		}
		waiting.set(info.name, apply);
		emit(KEYBIND.announceEvent, info);
		setTimeout(() => {
			if (waiting.get(info.name) !== apply) return;
			waiting.delete(info.name);
			apply(info.defaultKey);
		}, 15e3);
	}
	/**
	* A key the player can rebind in GTA's settings (RegisterKeyMapping); no per-frame key polling. The default key
	* comes from ai-core's admin panel when set there: the mapping command carries the key (`+<name>_<key>`), so a new
	* default makes a new mapping that every player gets. It is registered once ai-core answered (at start).
	*/
	var Keybind = class {
		options;
		name;
		disabled;
		pressed = false;
		hash = 0;
		constructor(options) {
			this.options = options;
			this.name = options.name;
			this.disabled = options.disabled ?? false;
			requestKey({
				resource,
				name: options.name,
				description: options.description,
				defaultKey: options.defaultKey ?? "",
				mapper: options.defaultMapper ?? "keyboard"
			}, (key) => this.register(key.toUpperCase()));
		}
		register(key) {
			const command = key ? `${this.name}_${key}` : this.name;
			this.hash = GetHashKey(`+${command}`) | 2147483648;
			RegisterCommand(`+${command}`, () => this.press(true), false);
			RegisterCommand(`-${command}`, () => this.press(false), false);
			RegisterKeyMapping(`+${command}`, this.options.description, this.options.defaultMapper ?? "keyboard", key);
			setTimeout(() => {
				emit("chat:removeSuggestion", `/+${command}`);
				emit("chat:removeSuggestion", `/-${command}`);
			}, 500);
		}
		press(down) {
			if (this.disabled || !this.options.allowInPauseMenu && IsPauseMenuActive()) return;
			this.pressed = down;
			if (down) this.options.onPressed?.();
			else this.options.onReleased?.();
		}
		/** Whether the key is held now. */
		get isPressed() {
			return this.pressed;
		}
		/** The key the player has bound right now, for HUD hints ("" until the mapping is registered). */
		get currentKey() {
			return this.hash ? GetControlInstructionalButton(0, this.hash, true).substring(2) : "";
		}
		disable(disabled) {
			this.disabled = disabled;
			this.pressed = false;
		}
	};

// ../../../packages/lib/src/fivem/locale.ts
/** Convar holding the language (`setr ai:locale "en"` in misc.cfg); replicated so clients read it too. */
	const LOCALE_CONVAR = "ai:locale";
	function readLocaleFile(resource, lang) {
		const raw = LoadResourceFile(resource, `locales/${lang}.json`);
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		if (!isRecord(parsed)) return {};
		const texts = {};
		for (const [key, value] of Object.entries(parsed)) if (typeof value === "string") texts[key] = value;
		return texts;
	}
	/**
	* The resource's lang texts: `locales/en.json` (complete base) overlaid with `locales/<ai:locale>.json`.
	* `${OTHER_KEY}` inside a text is replaced by that text once at load. Returns `t(key, ...args)` filling
	* `{0}`, `{1}`...; a missing key returns the key itself so it is visible in game.
	*
	*   const t = createLocale<typeof import("../../locales/en.json")>();
	*   t("NOTIFY_NO_MONEY", price);
	*/
	function createLocale() {
		const texts = loadLocaleTexts();
		return (key, ...args) => formatText(texts[key] ?? key, args);
	}
	/**
	* The resource's merged lang table (`en.json` overlaid with the `ai:locale` language, `${KEY}` references
	* resolved). A NUI gets this once and fills `{0}` placeholders itself.
	*/
	function loadLocaleTexts(resource = GetCurrentResourceName()) {
		const lang = GetConvar(LOCALE_CONVAR, "en");
		const texts = {
			...readLocaleFile(resource, "en"),
			...lang === "en" ? {} : readLocaleFile(resource, lang)
		};
		for (const key of Object.keys(texts)) texts[key] = (texts[key] ?? "").replace(/\$\{([A-Z0-9_]+)\}/g, (match, ref) => texts[ref] ?? match);
		return texts;
	}

// resource/common/locale.ts
/** This resource's lang texts: `Locale("NOTIFY_NO_MONEY", price)`; keys typed from locales/en.json. */
	const Locale = createLocale();

// resource/common/resource.ts
	const ResourceName = GetCurrentResourceName();
	const ResourceContext = IsDuplicityVersion() ? "server" : "client";

// resource/client/index.ts
	const send = (m) => SendNUIMessage(m);
	const isObj = (v) => typeof v === "object" && v !== null;
	const inVehicle = () => cache.vehicle !== false && cache.seat === -1;
	const toggleDoor = (door) => {
		if (cache.vehicle === false) return;
		if (GetVehicleDoorAngleRatio(cache.vehicle, door) > .1) SetVehicleDoorShut(cache.vehicle, door, false);
		else SetVehicleDoorOpen(cache.vehicle, door, false, false);
	};
	/** The wheel: built-in items first, then what resources added; one level of sub wheels. */
	var Radial = class {
		items = /* @__PURE__ */ new Map();
		open = false;
		closedAt = 0;
		constructor() {
			const own = GetCurrentResourceName();
			this.add({
				id: "inventory",
				label: Locale("RADIAL_INVENTORY"),
				icon: "box-open",
				resource: own,
				onSelect: () => inventory.openInventory()
			});
			this.add({
				id: "vehicle",
				label: Locale("RADIAL_VEHICLE"),
				icon: "car",
				resource: own,
				when: inVehicle,
				children: [
					{
						id: "engine",
						label: Locale("RADIAL_ENGINE"),
						icon: "key",
						resource: own,
						onSelect: () => cache.vehicle !== false && SetVehicleEngineOn(cache.vehicle, !GetIsVehicleEngineRunning(cache.vehicle), false, true)
					},
					{
						id: "trunk",
						label: Locale("RADIAL_TRUNK"),
						icon: "car-rear",
						resource: own,
						onSelect: () => toggleDoor(5)
					},
					{
						id: "hood",
						label: Locale("RADIAL_HOOD"),
						icon: "car-side",
						resource: own,
						onSelect: () => toggleDoor(4)
					}
				]
			});
		}
		add(item) {
			this.items.set(item.id, item);
		}
		remove(id) {
			this.items.delete(id);
		}
		dropResource(resource) {
			for (const item of this.items.values()) if (item.resource === resource) this.items.delete(item.id);
		}
		visible(list) {
			return [...list].filter((i) => !i.when || i.when());
		}
		view(item) {
			return {
				id: item.id,
				label: item.label,
				icon: item.icon,
				children: item.children ? this.visible(item.children).map((c) => this.view(c)) : void 0
			};
		}
		show() {
			if (this.open || GetGameTimer() - this.closedAt < 300 || IsPauseMenuActive() || IsNuiFocused() || IsEntityDead(cache.ped)) return;
			const items = this.visible(this.items.values()).slice(0, 12);
			if (items.length === 0) return;
			this.open = true;
			SetNuiFocus(true, true);
			SetCursorLocation(.5, .5);
			send({
				action: "open",
				data: {
					items: items.map((i) => this.view(i)),
					back: Locale("RADIAL_BACK")
				}
			});
		}
		close() {
			if (!this.open) return;
			this.open = false;
			this.closedAt = GetGameTimer();
			SetNuiFocus(false, false);
			send({
				action: "close",
				data: null
			});
		}
		select(path) {
			let list = [...this.items.values()];
			let item;
			for (const id of path) {
				item = list.find((i) => i.id === id);
				list = item?.children ?? [];
			}
			this.close();
			item?.onSelect?.();
		}
	};
	const radial = new Radial();
	new Keybind({
		name: "radialmenu_open",
		description: Locale("KEYBIND_OPEN"),
		defaultKey: "F1",
		onPressed: () => radial.show()
	});
	RegisterNuiCallback("select", (d, cb) => {
		if (isObj(d) && Array.isArray(d.path)) radial.select(d.path.filter((p) => typeof p === "string"));
		cb(true);
	});
	RegisterNuiCallback("close", (_d, cb) => {
		radial.close();
		cb(true);
	});
	on("onClientResourceStop", (resource) => radial.dropResource(resource));
	/** Items other resources add: `AddItem({ id, label, icon, onSelect })` (own) and qb-radialmenu's `AddOption` / `RemoveOption`. */
	function toItem(v, resource) {
		if (!isObj(v) || typeof v.id !== "string" || typeof v.label !== "string") return null;
		const onSelect = typeof v.onSelect === "function" ? v.onSelect : typeof v.event === "string" ? () => emit(String(v.event)) : void 0;
		return {
			id: v.id,
			label: v.label.slice(0, 40),
			icon: typeof v.icon === "string" ? v.icon.replace(/^fa[srb]?-|^fa-solid fa-/, "") : "circle-dot",
			resource,
			onSelect
		};
	}
	let optionId = 0;
	const api = {
		AddItem: (data) => {
			const item = toItem(data, GetInvokingResource() ?? "");
			if (item) radial.add(item);
		},
		RemoveItem: (id) => typeof id === "string" && radial.remove(id),
		AddOption: (data, id) => {
			const key = typeof id === "string" ? id : `qb-${++optionId}`;
			const item = toItem(isObj(data) ? {
				...data,
				id: key,
				label: data.title ?? data.label
			} : null, GetInvokingResource() ?? "");
			if (item) radial.add(item);
			return key;
		},
		RemoveOption: (id) => typeof id === "string" && radial.remove(id)
	};
	for (const [name, fn] of Object.entries(api)) {
		registerExport(name, fn);
		provideExport("qb-radialmenu", name, fn);
	}

})();
}catch(e){globalThis.__aicoreReportError&&globalThis.__aicoreReportError("load: "+(e&&e.stack||e));throw e}
