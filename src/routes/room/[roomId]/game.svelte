<script lang="ts">
	import { goto } from '$app/navigation';
	import { room } from '$lib/game/data';
	import Fa from 'svelte-fa';
	import { onMount } from 'svelte';
	import { faArrowsRotate, faClock, faMusic } from '@fortawesome/free-solid-svg-icons';

	let turnDuration = 30_000;
	let currentTime = Date.now();

	$: players = $room?.players;
	$: currentTurn = $room?.currentTurn;
	$: currentArtist = $room?.enteredArtists[$room?.currentTurn - 1];
	$: currentTurnStartTime = $room?.currentTurnStartTime;
	$: remainingTime = currentTurnStartTime
		? new Date(currentTurnStartTime + turnDuration - currentTime).getTime()
		: 0;
	$: remainingTimeSeconds =
		Math.floor(remainingTime / 1000) < 0 ? 0 : Math.floor(remainingTime / 1000);

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
				{#each players as p}
					<div class="flex flex-col justify-center items-center">
						{p.username}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
