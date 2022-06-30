<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ClipBoard from '$lib/components/ClipBoard/index.svelte';
	import { room, player } from '$lib/game/data';
	import { faCrown } from '@fortawesome/free-solid-svg-icons';
	import type { StartMessage } from 'src/websocketserver/wstypes';
	import { onMount } from 'svelte';
	import Fa from 'svelte-fa';

	let roomId: string = $page.params.roomId;
	let url: string;

	$: playerCount = $room?.players.length;
	$: isHost =
		$room &&
		$player &&
		$room?.hostPlayerIndex === $room?.players.findIndex((p) => p.userId === $player?.userId);

	async function startGame() {
		const { websocket } = await import('$lib/websocket');

		const unsubscribeWs = websocket.subscribe((ws) => {
			if (!ws) return;

			let message: StartMessage = {
				type: 'START',
				body: {
					userId: $player?.userId as string,
					roomId
				}
			};

			ws.send(JSON.stringify(message));
		});
	}

	onMount(async () => {
		url = window.location.href;

		if ($player && $room?.id === roomId) {
			// Already joined room => checking for the start of the game
			const unsubscribeRoom = room.subscribe((r) => {
				if (r?.currentTurn != 0) {
					// Game has started, redirect to game page
					unsubscribeRoom();
					goto('/room/' + roomId + '/game');
				}
			});
		} else {
			// Not joined room
			room.set(null);
			goto(`/join/${roomId}`);
		}
	});
</script>

<div class="hero min-h-screen">
	<div class="hero-content text-center flex flex-col">
		<div>
			<h1 class="text-4xl font-bold">
				Room:
				<span class="text-secondary">
					{roomId}
					<ClipBoard value={url} />
				</span>
			</h1>
			<p class="py-6">Envoie le lien à tes freros pour qu'ils puissent rejoindre!</p>
		</div>
		{#if $room}
			<div class="card shadow-xl">
				<div class="card-body">
					<h2 class="text-xl font-semibold">Joueurs:</h2>
					<div class="flex flex-col items-center">
						{#each $room.players as pl, i}
							<span
								class="inline-flex"
								class:text-primary={pl.userId === $player?.userId}
								class:font-semibold={pl.userId === $player?.userId}
							>
								{#if i === $room.hostPlayerIndex}
									<span class="mt-1 mr-1">
										<Fa icon={faCrown} color="orange" />
									</span>
								{/if}
								{pl.username}
							</span>
						{/each}
					</div>
				</div>
			</div>
			<div class="form-control flex flex-row gap-4">
				<button
					class="btn btn-error"
					on:click={() => {
						goto('/');
					}}
				>
					Partir
				</button>
				{#if isHost}
					<button
						class="btn btn-primary"
						disabled={!!(playerCount && playerCount < 2)}
						on:click={startGame}
					>
						Commencer
					</button>
				{/if}
			</div>
		{/if}
	</div>
</div>
