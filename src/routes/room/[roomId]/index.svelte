<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ClipBoard from '$lib/components/ClipBoard/index.svelte';
	import { room, player } from '$lib/game/data';
	import type {
		LeaveMessage,
		ModeType,
		SettingMessage,
		StartMessage
	} from 'src/websocketserver/wstypes';
	import { IsSpotifyPlaylist } from '$lib/room/util';
	import PlaylistInput from '$lib/components/inputs/PlaylistInput.svelte';
	import type { SendMessage } from '$lib/websocket';

	let sendMessage: SendMessage;
	let roomId: string = $page.params.roomId;
	let url: string;
	let chosenCategory: any;
	let timeBetweenRound: number = 30;
	let modeTv: boolean = false;

	$: playerCount = $room?.players.length;
	$: isHost =
		$room &&
		$player &&
		$room?.hostPlayerIndex === $room?.players.findIndex((p) => p.userId === $player?.userId);

	let startGamePressed: boolean = false;
	async function startGame() {
		if (!IsSpotifyPlaylist(chosenCategory.url)) {
			return;
		}

		startGamePressed = true;

		let message: StartMessage = {
			type: 'START',
			body: {
				userId: $player?.userId as string,
				roomId,
				timeBetweenRound: timeBetweenRound as number
			}
		};
		sendMessage(message);
	}

	async function updateSettings() {
		if (!isHost) {
			return;
		}

		// Send settings to server
		let message: SettingMessage = {
			type: 'SETTING',
			body: {
				roomId,
				userId: $player?.userId as string,
				timeBetweenRound: timeBetweenRound as number,
				mode: modeTv ? 'TV' : ('NORMAL' as ModeType),
				playlistStart: chosenCategory.url as string
			}
		};
		sendMessage(message);
	}

	async function handleLeave() {
		// Send settings to server
		let message: LeaveMessage = {
			type: 'LEAVE',
			body: {
				roomId,
				userId: $player?.userId as string
			}
		};
		sendMessage(message);
	}

	onMount(async () => {
		// Check if game is over or is has started
		if ($room?.isGameOver) {
			goto('/room/' + roomId + '/game');
			return;
		}

		let { sm } = await import('$lib/websocket');
		sendMessage = sm;

		url = window.location.href;

		if ($player && $room?.id === roomId) {
			// Already joined room => checking for the start of the game
			const unsubscribeRoom = room.subscribe((r) => {
				console.log(r);

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

<svelte:window on:beforeunload={handleLeave} />
<div class="hero min-h-screen">
	<div class="hero-content text-center flex flex-col">

		{#if startGamePressed}
			<div>
				<h1 class="text-4xl font-bold">Chargement</h1>
				<div
					class="animate-spin radial-progress mt-4 text-primary"
					style="--value:80; --size:3rem; --thickness: 0.5rem;"
				/>
			</div>
		{:else}

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
						<div class="flex flex-col items-center max-h-20 overflow-auto">
							{#each $room.players as pl, i}
								<span
									class="inline-flex"
									class:text-primary={pl.userId === $player?.userId}
									class:font-semibold={pl.userId === $player?.userId}
								>
									{#if i === $room.hostPlayerIndex}
										<span class="mr-1">
											<i class="fa-solid fa-crown text-primary" />
										</span>
									{/if}
									{pl.username}
								</span>
							{/each}
						</div>
					</div>
				</div>
				<p class="text-sm">Seul l'host de la room peut changer les paramètres.</p>
				<PlaylistInput
					bind:chosenCategory
					nonHostValue={$room.playlistStart}
					onChange={() => {
						updateSettings();
					}}
					{isHost}
				/>
				<div class="form-control w-full max-w-xs">
					<label class="label">
						<span class="label-text">Temps de réponse ({$room?.timeBetweenRound}s)</span>
						<input class="hidden" />
					</label>
					<div
						class="tooltip tooltip-primary tooltip-right"
						data-tip="Délais avant lequel il faut donner votre réponse."
					>
						<input
							type="range"
							disabled={!isHost}
							value={isHost ? timeBetweenRound : $room.timeBetweenRound}
							min="1"
							max="60"
							step="1"
							class="range"
							class:range-primary={isHost}
							on:change={(e) => {
								timeBetweenRound = e.target?.value;
								updateSettings();
							}}
						/>
					</div>
					<div
						class="tooltip tooltip-primary tooltip-right"
						data-tip="La partie est uniquement retransmise sur l'écran de l'host."
					>
						<label class="label">
							<span class="label-text">Mode TV</span>
							<input
								disabled={!isHost}
								type="checkbox"
								checked={isHost ? modeTv : $room.mode === 'TV'}
								on:change={(e) => {
									modeTv = e?.target?.checked;
									updateSettings();
								}}
								class="checkbox checkbox-primary"
							/>
						</label>
					</div>
				</div>
				<div class="form-control flex flex-row gap-4">
					<button
						class="btn btn-error"
						on:click={async () => {
							await handleLeave();
							goto('/');
						}}
					>
						Partir
					</button>
					{#if isHost}
						<div
							class="tooltip tooltip-primary tooltip-bottom"
							data-tip={playerCount && playerCount < 3 && modeTv
								? 'Il faut au moins 3 joueurs pour jouer en mode TV.'
								: playerCount && playerCount < 2
								? 'Il faut au moins 2 joueurs pour jouer.'
								: "C'est parti!"}
						>
							<button
								class="btn btn-primary"
								disabled={!!(playerCount && (playerCount < 2 || (playerCount < 3 && modeTv)))}
								on:click={startGame}
							>
								Commencer
							</button>
						</div>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
</div>