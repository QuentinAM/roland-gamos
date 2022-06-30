import type { Room } from "src/websocket/wstypes";
import { writable } from "svelte/store";

export const room = writable<Room | null>(null);