import type { Artist, Player, Room } from 'src/websocketserver/wstypes';
import { writable } from 'svelte/store';

export const room = writable<Room | null>(null);
export const autoComplete = writable<Artist[] | null>(null);
export const player = writable<Player | null>(null);
player.subscribe((p) => {
	if (p != null) localStorage.setItem('username', p?.username);
});
