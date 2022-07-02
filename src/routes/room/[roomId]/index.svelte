<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ClipBoard from '$lib/components/ClipBoard/index.svelte';
	import { room, player } from '$lib/game/data';
	import type { StartMessage } from 'src/websocketserver/wstypes';
	import { IsSpotifyPlaylist } from '$lib/room/util';
	import PlaylistInput from '$lib/components/inputs/PlaylistInput.svelte';
	import type { SendMessage } from '$lib/websocket';

	let sendMessage: SendMessage;
	let roomId: string = $page.params.roomId;
	let url: string;
	let chosenCategory: any;
	let timeBetweenRound = 30;

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
				playlistStart: chosenCategory.url as string,
				userId: $player?.userId as string,
				roomId,
				timeBetweenRound: timeBetweenRound as number
			}
		};
		sendMessage(message);
	}

	function validTimeBetweenTime(node: any, value: any){
		return {
			update(value: any) {
				timeBetweenRound = value === null || timeBetweenRound < node.min ? timeBetweenRound : parseInt(value);
			}
		}
	}

	onMount(async () => {
		let { sm } = await import('$lib/websocket');
		sendMessage = sm;

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

{#if startGamePressed}
	<div class="hero min-h-screen" transition:fade>
		<div class="hero-content text-center flex flex-col">
			<div>
				<h1 class="text-4xl font-bold">Chargement</h1>
				<div
					class="animate-spin radial-progress mt-4 text-primary"
					style="--value:80; --size:3rem; --thickness: 0.5rem;"
				/>
			</div>
		</div>
	</div>
{:else}
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
				{#if isHost}
					<p class="text-sm">Seul l'host de la room peut changer les paramètres.</p>
					<PlaylistInput bind:chosenCategory/>
					<div class="form-control w-full max-w-xs">
						<label class="label">
							<span class="label-text">Durée entre chaque round</span>
							<input class="hidden"/>
						</label>
						<div class="tooltip tooltip-right" data-tip="">
							<input
								type='number'
								class="input input-primary w-full"
								min=1
								use:validTimeBetweenTime={timeBetweenRound}
								bind:value={timeBetweenRound}
							/>
						</div>
					</div>
				{/if}
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
{/if}
