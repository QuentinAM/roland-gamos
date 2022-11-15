<script lang="ts">
	import { autoComplete } from '$lib/game/data';
	import type { Artist } from 'src/websocketserver/wstypes';

	import { onMount } from 'svelte';

	import AutoCompleteChoice from './AutoCompleteChoice.svelte';

	export let guess: string;
	export let placeholder: string;
	export let onInput: any;
	export let onValidate: any;
	export let currentPlayerHasAttemptedGuess: boolean | undefined;

	let filtered: any[] = [];
	let searchInput: HTMLInputElement;
	let selectionIndex: number = 0;

	const filter = async (artists: Artist[]) => {
		if (!guess) {
			filtered = [];
			return;
		}

		let storageArr: any[] = [];
		if (guess) {
			artists.forEach((artist: any) => {
				if (
					artist.name.toLowerCase().startsWith(guess.toLowerCase()) ||
					artist.name
						.toLowerCase()
						.normalize('NFD')
						.replace(/[\u0300-\u036f]/g, '')
						.startsWith(guess.toLowerCase())
				) {
					storageArr = [
						...storageArr,
						{
							name: makeMatchBold(artist.name),
							artistImage: artist.artistImage
						}
					];
				}
			});
		}

		// Check if artist found
		if (storageArr.find((artist) => artist.name === makeMatchBold(guess))) {
			filtered = [];
			return;
		}

		filtered = storageArr;

		// Update index
		if (selectionIndex > filtered.length - 1) {
			selectionIndex = filtered.length - 1;
		}
	};

	const clearInput = () => {
		guess = '';
		filtered = [];
		searchInput.focus();
	};

	const setInputVal = (artist: any) => {
		if (!artist) return;
		guess = removeBold(artist.name);
		onInput();
		filtered = [];
		selectionIndex = 0;
		searchInput.focus();
	};

	const makeMatchBold = (str: string) => {
		const matched = str.substring(0, guess.length);
		const makeBold = `<strong>${matched}</strong>`;
		return str.replace(matched, makeBold);
	};

	const removeBold = (str: string) => {
		return str.replace(/<(.)*?>/g, '');
	};

	const navigateList = (e: any) => {
		if (e.key === 'ArrowDown') {
			selectionIndex++;
			if (selectionIndex >= filtered.length) {
				selectionIndex = 0;
			}
		} else if (e.key === 'ArrowUp') {
			selectionIndex--;
			if (selectionIndex < 0) {
				selectionIndex = filtered.length - 1;
			}
		} else if (e.key === 'Escape') {
			clearInput();
		} else if (e.key === 'Enter') {
			if (filtered.length === 0) {
				onValidate();
			}

			setInputVal(filtered[selectionIndex]);
		}
	};

	onMount(() => {
		autoComplete.subscribe((artists) => {
			if (!artists) return;
			filter(artists);
		});
	});
</script>

<div class="w-full">
	{#if filtered.length > 0 && !currentPlayerHasAttemptedGuess}
		<ul class="w-full">
			{#each filtered as artist, index}
				<AutoCompleteChoice
					{artist}
					lastElement={index === filtered.length - 1}
					highlighted={index === selectionIndex}
					on:click={() => setInputVal(artist)}
				/>
			{/each}
		</ul>
	{/if}
	<div class="flex flex-row">
		<!-- svelte-ignore a11y-autofocus -->
		<input
			id="country-input"
			type="text"
			{placeholder}
			class="input input-primary w-full rounded-r-none"
			bind:this={searchInput}
			bind:value={guess}
			on:input={() => {
				onInput();
			}}
			on:keydown={navigateList}
			disabled={currentPlayerHasAttemptedGuess}
			autofocus
		/>
		<button
			class="btn btn-success rounded-l-none"
			on:click={onValidate}
			disabled={currentPlayerHasAttemptedGuess}
		>
			<span class="mr-2">
				<i class="fa-solid fa-check" />
			</span> Valider
		</button>
	</div>
</div>
