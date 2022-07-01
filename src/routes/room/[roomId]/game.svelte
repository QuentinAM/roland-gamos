<script lang="ts">
	import { goto } from '$app/navigation';
	import { room, player } from '$lib/game/data';
	import { onMount } from 'svelte';
	import Featuring from '$lib/components/Featuring/index.svelte';
	import { CutTrackName } from '$lib/game/util';
	import type { GuessingMessage, GuessMessage } from 'src/websocketserver/wstypes';

	let turnDuration = 30_000;
	let currentTime = Date.now();

	$: players = $room?.players;
	$: currentTurn = $room?.currentTurn;
	$: currentGuess = $room?.currentGuess;
	$: currentArtist = $room?.enteredArtists[$room?.currentTurn - 1];
	$: currentTrack = $room?.tracks[$room?.tracks.length - 1];
	$: currentPlayerIndex = $room?.currentPlayerIndex;
	$: currentPlayerHasAttemptedGuess = $room?.currentPlayerHasAttemptedGuess;
	$: currentPlayerHasGuessed = $room?.currentPlayerHasGuessed;
	$: currentTurnStartTime = $room?.currentTurnStartTime;
	$: eliminatedPlayers = $room?.eliminatedPlayers;
	$: remainingTime = currentTurnStartTime
		? new Date(currentTurnStartTime + turnDuration - currentTime).getTime()
		: 0;
	$: remainingTimeSeconds =
		Math.floor(remainingTime / 1000) < 0 ? 0 : Math.floor(remainingTime / 1000);

	$: isCurrentPlayer =
		players && currentPlayerIndex != undefined
			? players[currentPlayerIndex]?.userId === $player?.userId
			: false;
	$: isGameOver = $room?.players?.length === 1;

	$: tracks = $room?.tracks;

	let guess = '';
	// Send the final guess attempt to the server
	async function submitGuess() {
		const { websocket } = await import('$lib/websocket');

		console.log('currentGuess: ', guess);

		let success = false;
		const unsubscribe = websocket.subscribe((ws) => {
			if (!ws) return;

			let message: GuessMessage = {
				type: 'GUESS',
				body: {
					guess: guess,
					roomId: $room?.id as string,
					userId: $player?.userId as string
				}
			};

			ws.send(JSON.stringify(message));
			currentPlayerHasAttemptedGuess = true;
			success = true;
			guess = '';
		});
		if (success) {
			console.log('Unsubscribed');
			unsubscribe();
		}
	}

	// Send the current guess attempt to the server
	async function guessing() {
		const { websocket } = await import('$lib/websocket');

		console.log('currentGuess: ', guess);

		let success = false;
		const unsubscribe = websocket.subscribe((ws) => {
			if (!ws) return;

			let message: GuessingMessage = {
				type: 'GUESSING',
				body: {
					currentGuess: guess,
					roomId: $room?.id as string,
					userId: $player?.userId as string
				}
			};

			ws.send(JSON.stringify(message));
			success = true;
		});
		if (success) {
			console.log('Unsubscribed');
			unsubscribe();
		}
	}

	onMount(async () => {
		const { websocket } = await import('$lib/websocket');

		// Check if a room is present
		if (!$room) {
			goto('/');
		}

		// Update the remaining time every second
		setInterval(() => {
			if (!currentPlayerHasAttemptedGuess) currentTime = Date.now();
		}, 1_000);
	});
</script>

{#if isGameOver}
	<div class="hero min-h-screen">
		<div class="hero-content flex flex-row justify-start items-start h-full w-full">
			<div class="flex flex-col w-full justify-start">
				<h1 class="font-bold">Partie terminée</h1>
				<div class="overflow-auto h-64">
					<table class="table w-full">
						<!-- head -->
						<thead>
							<tr>
							<th></th>
							<th>Joueur</th>
							<th>Dernier tour</th>
							</tr>
						</thead>
						<tbody>
							<!-- row 1 -->
							<tr class="active">
								<th class="text-primary text-bold text-xl">1er</th>
								<td class="text-primary text-bold text-xl">{$room?.players[0].username}</td>
								<td class="text-primary text-bold text-xl">{$room?.currentTurn}</td>
							</tr>
							{#if eliminatedPlayers}
								{#each eliminatedPlayers.reverse() as p, i}
									<tr>
										<th>{i + 2}ème</th>
										<td>{p.username}</td>
										<td>{p.turn}</td>
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>
				<div class="flex flex-row">
					<div>
						<h1 class="font-bold">
							Titres joués
						</h1>
						<div class="h-[33rem] carousel carousel-vertical rounded-box">
							{#if tracks}
								{#each tracks as track, i}
								<div class="carousel-item h-full">
									<Featuring
										number={`${i + 1}/${tracks.length}`}
										audioUrl={track.previewUrl}
										title={track.name}
										imgUrl={track.trackImage}
										releaseDate={track.releaseDate}
										artist1ImageUrl={track.artist.imageUrl}
										artist2ImageUrl={$room?.enteredArtists[i]?.imageUrl}
										artist1Name={track.artist.name}
										artist2Name={$room?.enteredArtists[i]?.name}
									/>
									</div>
								{/each}
							{/if}
						</div>
					</div>
					<div class="ml-20">
						<h1 class="font-bold">
							Statistiques
						</h1>
						<div class="stats stats-vertical shadow">
	
							{#if $room?.currentTurnStartTime}
								<div class="stat">
									<div class="stat-title">Durée</div>
									<div class="stat-value">{(new Date().getTime() - new Date($room?.currentTurnStartTime * 1000).getTime())/60000}</div>
									<div class="stat-desc">Minutes</div>
								</div>
							{/if}
								
							{#if tracks && tracks.length > 0}
								<div class="stat">
									<div class="stat-title">Morceau le plus ancien</div>
									<div class="stat-value">
										{tracks.reduce(function(prev, curr) {
											return prev.releaseDate < curr.releaseDate ? prev : curr;
										}).name}
									</div>
									<div class="stat-desc">
										{tracks.reduce(function(prev, curr) {
											return prev.releaseDate < curr.releaseDate ? prev : curr;
										}).releaseDate}	
									</div>
								</div>
							{/if}
								
							{#if tracks}
								<div class="stat">
									<div class="stat-title">Morceau le plus récent</div>
									<div class="stat-value">
										{tracks.reduce(function(prev, curr) {
											return prev.releaseDate > curr.releaseDate ? prev : curr;
										}).name}
									</div>
									<div class="stat-desc">
										{tracks.reduce(function(prev, curr) {
											return prev.releaseDate > curr.releaseDate ? prev : curr;
										}).releaseDate}	
									</div>
								</div>
							{/if}
							
						</div>
					</div>
				</div>
				<div class="flex flex-row">
					<button class="btn btn-error m-1" 
						on:click={() => {
							goto('/');
						}}
					>
						Quitter
					</button>
					{#if $room?.hostPlayerId}
						{#if $room?.hostPlayerId === $player?.userId}
							<button class="btn btn-primary m-1" on:click={() => {}}>
								Rejouer
							</button>
						{/if}
					{/if}
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="hero min-h-screen">
		<div class="hero-content flex flex-row justify-start items-start h-full w-full">
			<div class="flex flex-col w-full justify-start">
				<div class="stats shadow">
					<div class="stat bg-primary">
						<div class="stat-figure text-primary-content" />
						<div class="stat-title text-primary-content">Tour</div>
						<div class="stat-value text-primary-content inline-flex">
							<span class="mr-4">
								<i class="fa-solid fa-arrows-rotate" />
							</span>
							{currentTurn}
						</div>
					</div>
					<div class="stat bg-secondary">
						<div class="stat-title text-secondary-content">Temps Restant</div>
						<div class="stat-value text-secondary-content inline-flex">
							<span class="mr-4">
								<i class="fa-solid fa-clock" />
							</span>
							{remainingTimeSeconds}s
						</div>
					</div>
					<div class="stat bg-accent">
						<div class="stat-title text-accent-content">Artiste</div>
						<div class="stat-value text-accent-content inline-flex">
							<span class="mr-4">
								<i class="fa-solid fa-music" />
							</span>
							{currentArtist?.name ?? 'Aucun'}
						</div>
					</div>
				</div>

				{#if players}
					<div class="grid grid-cols-4 grid-flow-row gap-8 mt-16 w-full">
						{#each players as p, i}
							<div class="flex flex-col justify-center items-center">
								<p class="font-semibold">{p.username}</p>
								<div
									class="w-[60%] h-2 rounded"
									class:bg-primary={currentPlayerIndex === i}
									class:bg-base-300={currentPlayerIndex !== i}
								/>
								<div
									class="w-[50%] h-16 rounded-b shadow-lg"
									class:bg-primary={currentPlayerIndex === i}
									class:bg-base-300={currentPlayerIndex !== i}
								>
									{#if currentPlayerIndex === i}
										<div
											class="p-2 m-2 text-2xs text-center rounded"
											class:bg-base-100={!currentPlayerHasGuessed && remainingTimeSeconds > 0}
											class:bg-success={currentPlayerHasGuessed}
											class:bg-error={(!currentPlayerHasGuessed && remainingTimeSeconds <= 0) ||
												(currentPlayerHasAttemptedGuess && !currentPlayerHasGuessed)}
										>
											{currentGuess || '‎'}
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			{#if currentTrack}
				<Featuring
					number={undefined}
					audioUrl={currentTrack.previewUrl}
					artist2ImageUrl={$room?.enteredArtists[$room?.currentTurn - 2]?.imageUrl ??
						currentArtist?.imageUrl ??
						''}
					artist2Name={$room?.enteredArtists[$room?.currentTurn - 2]?.name ??
						currentArtist?.name ??
						''}
					artist1ImageUrl={currentTrack.artist.imageUrl}
					artist1Name={currentTrack.artist.name}
					imgUrl={currentTrack.trackImage}
					releaseDate={currentTrack.releaseDate}
					title={CutTrackName(currentTrack.name)}
				/>
			{/if}
		</div>
	</div>
	{#if isCurrentPlayer}
		<div class="absolute bottom-0 p-16 w-full">
			<div class="card shadow-lg">
				<div class="card-body">
					<div class="form-control flex-row">
						<input
							class="input input-primary w-full rounded-r-none"
							type="text"
							placeholder="Entre un artiste."
							bind:value={guess}
							on:input={guessing}
							disabled={currentPlayerHasAttemptedGuess}
						/>
						<button
							class="btn btn-success rounded-l-none"
							on:click={submitGuess}
							disabled={currentPlayerHasAttemptedGuess}
						>
							<span class="mr-2">
								<i class="fa-solid fa-check" />
							</span> Valider
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
{/if}