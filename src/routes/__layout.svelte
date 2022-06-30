<script>
	import { onMount } from 'svelte';

	import '../app.css';

	onMount(() => {
		localStorage.setItem('userId', localStorage.getItem('userId') || crypto.randomUUID());
	});
</script>

<slot />
