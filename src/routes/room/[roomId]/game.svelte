<script lang="ts">
	import { goto } from '$app/navigation';
	import { room, player } from '$lib/game/data';
	import Fa from 'svelte-fa';
	import { onMount } from 'svelte';
	import { faArrowsRotate, faCheck, faClock, faMusic } from '@fortawesome/free-solid-svg-icons';
	import Featuring from '$lib/components/Featuring/index.svelte';
	import type { GuessingMessage, GuessMessage } from 'src/websocketserver/wstypes';

	let turnDuration = 30_000;
	let currentTime = Date.now();

	$: players = $room?.players;
	$: currentTurn = $room?.currentTurn;
	$: currentGuess = $room?.currentGuess;
	$: currentArtist = $room?.enteredArtists[$room?.currentTurn - 1];
	$: currentTrack = $room?.currentTrack;
	$: currentPlayerIndex = $room?.currentPlayerIndex;
	$: currentPlayerHasAttemptedGuess = $room?.currentPlayerHasAttemptedGuess;
	$: currentPlayerHasGuessed = $room?.currentPlayerHasGuessed;
	$: currentTurnStartTime = $room?.currentTurnStartTime;
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

<div class="hero min-h-screen">
	<div class="hero-content flex flex-row justify-start items-start h-full w-full">
		<div class="flex flex-col w-full justify-start">
			<div class="stats shadow">
				<div class="stat bg-primary">
					<div class="stat-figure text-primary-content" />
					<div class="stat-title text-primary-content">Tour</div>
					<div class="stat-value text-primary-content inline-flex">
						{currentTurn}
						<span class="ml-4 mt-2">
							<Fa icon={faArrowsRotate} size={'xs'} />
						</span>
					</div>
				</div>
				<div class="stat bg-secondary">
					<div class="stat-title text-secondary-content">Temps Restant</div>
					<div class="stat-value text-secondary-content inline-flex">
						{remainingTimeSeconds}s
						<span class="ml-4 mt-2">
							<Fa icon={faClock} size={'xs'} />
						</span>
					</div>
				</div>
				<div class="stat bg-accent">
					<div class="stat-title text-accent-content">Artiste</div>
					<div class="stat-value text-accent-content inline-flex">
						{currentArtist?.name ?? 'Aucun'}
						<span class="ml-4 mt-2">
							<Fa icon={faMusic} size={'xs'} />
						</span>
					</div>
				</div>
			</div>

			{#if players}
				<div class="grid grid-cols-4 grid-flow-row gap-8 mt-16 w-full">
					{#each players as p, i}
						<div class="flex flex-col justify-center items-center">
							<p class="font-semibold">{p.username}</p>
							<div
								class="w-[50%]  h-2 rounded"
								class:bg-primary={currentPlayerIndex === i}
								class:bg-base-300={currentPlayerIndex !== i}
							/>
							<div
								class="w-[40%] h-16 rounded-b shadow-lg"
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
				audioUrl={currentTrack.previewUrl}
				artist1ImageUrl={currentArtist?.imageUrl ?? ''}
				artist2ImageUrl={currentTrack.artist.imageUrl}
				imgUrl={currentTrack.trackImage}
				releaseDate={currentTrack.releaseDate}
				title={currentTrack.name}
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
							<Fa icon={faCheck} size={'lg'} />
						</span> Valider
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
