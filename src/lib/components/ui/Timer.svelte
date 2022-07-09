<script lang="ts">
	import { onMount } from 'svelte';
	import { scale, fade } from 'svelte/transition';

	let number = 3;

	function decrement() {
		number--;

		if (number > 0) {
			setTimeout(decrement, 1000);
		}
	}

	onMount(() => {
		setTimeout(decrement, 1000);
	});
</script>

<div class="absolute z-50 w-full h-full flex items-center justify-center pointer-events-none" transition:scale>
	<p>
		<span
			class="text-8xl font-bold"
			class:text-primary={number == 3}
			class:text-secondary={number == 2}
			class:text-accent={number == 1}
			transition:fade
		>
			{number}
		</span>
	</p>
</div>