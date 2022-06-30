<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ClipBoard from '$lib/components/ClipBoard/index.svelte';
	import { room } from '$lib/game/data';
	import { faCrown } from '@fortawesome/free-solid-svg-icons';
	import { onMount } from 'svelte';
	import Fa from 'svelte-fa';

	let roomId: string = $page.params.roomId;
	let url: string;

	onMount(async () => {
		const { websocket } = await import('$lib/websocket');
		url = window.location.href;

		if ($room?.id === roomId) {
			// Already joined room => good
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
						{#each $room.players as player, i}
							<span class="inline-flex">
								{#if i === $room.hostPlayerIndex}
									<span class="mt-1 mr-1">
										<Fa icon={faCrown} color="orange" />
									</span>
								{/if}
								{player.username}
							</span>
						{/each}
					</div>
				</div>
			</div>
			<button
				class="btn btn-error"
				on:click={() => {
					goto('/');
				}}>Annuler</button
			>
		{/if}
	</div>
</div>
