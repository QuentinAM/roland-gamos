<script lang="ts">
	import { goto } from '$app/navigation';
	import { room, player } from '$lib/game/data';
	import Fa from 'svelte-fa';
	import { onMount } from 'svelte';
	import { faArrowsRotate, faCheck, faClock, faMusic } from '@fortawesome/free-solid-svg-icons';

	let turnDuration = 30_000;
	let currentTime = Date.now();

	$: players = $room?.players;
	$: currentTurn = $room?.currentTurn;
	$: currentArtist = $room?.enteredArtists[$room?.currentTurn - 1];
	$: currentPlayerIndex = $room?.currentPlayerIndex;
	$: currentTurnStartTime = $room?.currentTurnStartTime;
	$: remainingTime = currentTurnStartTime
		? new Date(currentTurnStartTime + turnDuration - currentTime).getTime()
		: 0;
	$: remainingTimeSeconds =
		Math.floor(remainingTime / 1000) < 0 ? 0 : Math.floor(remainingTime / 1000);

	$: isCurrentPlayer =
		players && currentPlayerIndex != undefined
			? players[currentPlayerIndex].userId === $player?.userId
			: false;

	onMount(async () => {
		const { websocket } = await import('$lib/websocket');

		if (!$room) {
			goto('/');
		}

		setInterval(() => {
			currentTime = Date.now();
		}, 1_000);

		console.log($room);
	});
</script>

<div class="hero min-h-screen">
	<div class="hero-content flex flex-col justify-start h-full w-full">
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
						/>
					</div>
				{/each}
			</div>
		{/if}

		{#if isCurrentPlayer}
			<div class="absolute bottom-0 p-16 w-full">
				<div class="card shadow-lg">
					<div class="card-body">
						<div class="form-control flex-row">
							<input
								class="input input-primary w-full rounded-r-none"
								type="text"
								placeholder="Entre un artiste."
							/>
							<button class="btn btn-success rounded-l-none">
								<span class="mr-2">
									<Fa icon={faCheck} size={'lg'} />
								</span> Valider
							</button>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
