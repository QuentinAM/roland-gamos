<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ClipBoard from '$lib/components/ClipBoard/index.svelte';
	import { onMount } from 'svelte';

	let roomId: string = $page.params.roomId;
	let url: string;

	onMount(() => {
		url = window.location.href;
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
		<div class="card shadow-xl">
			<div class="card-body">
				<h2 class="text-xl font-semibold">Joueurs:</h2>
			</div>
		</div>
		<button
			class="btn btn-error"
			on:click={() => {
				goto('/');
			}}>Annuler</button
		>
	</div>
</div>
