<script lang="ts">
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';

	let number = 5;

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
			class:text-primary={number == 5}
			class:text-secondary={number == 4}
			class:text-accent={number != 5 && number != 4}
		>
			{number}
		</span>
	</p>
</div>