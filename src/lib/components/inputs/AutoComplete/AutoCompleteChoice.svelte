<script lang="ts">
	import { slide } from 'svelte/transition';

	export let artist: any;
	export let highlighted: boolean;
	export let lastElement: boolean;
</script>

<li
	class="list-none cursor-pointer p-2 w-full border border-primary hover:bg-blue-500 z-50"
	class:bg-primary={highlighted}
	class:rounded-br={lastElement}
	class:rounded-bl={lastElement}
	on:click
	transition:slide
>
	<div class="avatar">
		<div class="w-10 h-10 rounded-full">
			<img src={artist.artistImage} alt="weqwe" />
		</div>
		{@html artist.name}
	</div>
</li>
