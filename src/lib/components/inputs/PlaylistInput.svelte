<script lang="ts">
	import { IsSpotifyPlaylist } from '$lib/room/util';
	export let chosenCategory: any;

	const categories: Array<any> = [
		{
			name: 'Rap FR',
			url: 'https://open.spotify.com/playlist/4l1CEhc7ZPbaEtiPdCSGbl'
		},
		{
			name: 'Rap US',
			url: 'https://open.spotify.com/playlist/0yXgmsghbdU2yuWVQ2fcAI'
		},
		{
			name: 'Hip-Hop',
			url: 'https://open.spotify.com/playlist/37i9dQZF1DX9oh43oAzkyx'
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
</script>

<div class="form-control w-full max-w-xs">
	<label class="label">
		<span class="label-text">Catégorie</span>
		<input class="hidden" />
	</label>
	<div
		class="tooltip lg:tooltip-right md:tooltip-top"
		data-tip="L'artiste de départ est prit au hasard dans la playlist du genre musical sélectionné."
	>
		<select class="select select-primary select-bordered w-full" bind:value={chosenCategory}>
			{#each categories as category, i}
				<option value={category}>{category.name}</option>
			{/each}
		</select>
	</div>
	{#if chosenCategory}
		{#if chosenCategory.name === 'Autre'}
			<div class="form-control w-full max-w-xs">
				<label class="label">
					<span class="label-text">URL de la playlist Spotify</span>
					<input class="hidden" />
				</label>
				<div
					class="tooltip lg:tooltip-right md:tooltip-bottom"
					data-tip="Exemple: https://open.spotify.com/playlist/37i9dQZF1DWU4xkXueiKGW"
				>
					<input
						class="input input-bordered input-primary w-full"
						class:input-error={!IsSpotifyPlaylist(chosenCategory.url) && chosenCategory.url}
						type="text"
						placeholder="URL Spotify de la playlist"
						bind:value={chosenCategory.url}
					/>
				</div>
			</div>
		{/if}
	{/if}
</div>
