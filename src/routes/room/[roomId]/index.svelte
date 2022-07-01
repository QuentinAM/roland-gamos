<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ClipBoard from '$lib/components/ClipBoard/index.svelte';
	import { room, player } from '$lib/game/data';
	import type { StartMessage } from 'src/websocketserver/wstypes';
	import { onMount } from 'svelte';
	import { IsSpotifyPlaylist } from '$lib/room/util';

	let roomId: string = $page.params.roomId;
	let url: string;
	let actualCategory: any;
	const categories: Array<any> = [
		{
			name: 'Rap FR',
			url: 'https://open.spotify.com/playlist/37i9dQZF1DWU4xkXueiKGW'
		},
		{
			name: 'Rap US',
			url: 'https://open.spotify.com/playlist/37i9dQZF1DXawlg2SZawZf'
		},
		{
			name: 'Electro',
			url: 'https://open.spotify.com/playlist/1sp8HUbfqK8TJA0YbMI7Tx'
		},
		{
			name: 'Latino',
			url: 'https://open.spotify.com/playlist/37i9dQZF1DWVGjWxwGtpup'
		},
		{
			name: 'Hip-Hop',
			url: 'https://open.spotify.com/playlist/37i9dQZF1DX9oh43oAzkyx'
		},
		{
			name: 'Rock',
			url: 'https://open.spotify.com/playlist/37i9dQZF1DWWSuZL7uNdVA'
		},
		{
			name: 'K-Pop',
			url: 'https://open.spotify.com/playlist/37i9dQZF1DX9tPFwDMOaN1'
		},
		{
			name: 'Autre',
			url: ''
		}
	];

	$: playerCount = $room?.players.length;
	$: isHost =
		$room &&
		$player &&
		$room?.hostPlayerIndex === $room?.players.findIndex((p) => p.userId === $player?.userId);

	async function startGame() {

		if (!IsSpotifyPlaylist(actualCategory.url))
		{
			return;
		}

		const { websocket } = await import('$lib/websocket');

		const unsubscribeWs = websocket.subscribe((ws) => {
			if (!ws) return;

			console.log(actualCategory);
			let message: StartMessage = {
				type: 'START',
				body: {
					playlistStart: actualCategory.url as string,
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
				<div class="form-control w-full max-w-xs">
					<label class="label">
					<span class="label-text">Catégorie</span>
						<input class="hidden"/>
					</label>
					<div class="tooltip tooltip-left" data-tip="L'artiste de départ est prit au hasard dans la playlist du genre musical sélectionné.">
						<select class="select select-primary select-bordered w-full" bind:value={actualCategory}>
							{#each categories as category, i}
								<option value={category}>{category.name}</option>
							{/each}
						</select>
					</div>
					{#if actualCategory}
						{#if actualCategory.name === 'Autre'}
							<div class="form-control w-full max-w-xs">
								<label class="label">
									<span class="label-text">URL de la playlist Spotify</span>
									<input class="hidden"/>
								</label>
								<div class="tooltip tooltip-left" data-tip="Exemple: https://open.spotify.com/playlist/37i9dQZF1DWU4xkXueiKGW">
									<input 
										class="input input-bordered input-primary w-full" 
										class:input-error={!IsSpotifyPlaylist(actualCategory.url) && actualCategory.url} 
										type="text" 
										placeholder="URL Spotify de la playlist" 
										bind:value={actualCategory.url}/>
								</div>
							</div>
						{/if}
					{/if}
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
