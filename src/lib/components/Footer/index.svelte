<script lang="ts">
	import Translation from '$lib/components/Translation/index.svelte';
	import Selector from '$lib/components/Translation/Selector.svelte';
</script>

<footer
	class="footer gap-1 lg:gap-2 absolute bottom-0 items-center p-4 bg-transparent text-neutral-content "
>
	<div class="items-center grid-flow-col ">
		<a href="https://developer.spotify.com/terms/" target="_blank" class="hover:underline"
			>Spotify Developer Terms</a
		>
		<div class="divider divider-horizontal mx-1" />
		<a
			href="https://github.com/saadeghi/daisyui/blob/master/LICENSE"
			target="_blank"
			class="hover:underline">DaisyUI License</a
		>
	</div>
	<div class="grid-flow-col gap-2 md:place-self-center md:justify-self-end">
		<Selector />
		<div class="divider divider-horizontal mx-1" />
		<a href="https://github.com/QuentinAM/roland-gamos" target="_blank" class="hover:underline">
			GitHub
		</a>
		<div class="divider divider-horizontal mx-1" />
		<Translation id="created_by" />
		<a href="https://github.com/augustinbegue" target="_blank" class="hover:underline">
			Augustin B
		</a>
		<a href="https://github.com/QuentinAM" target="_blank" class="hover:underline"> Quentin AM </a>
	</div>
</footer>
