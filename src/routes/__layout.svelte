<script>
	import { onMount } from 'svelte';

	import '../app.css';

	onMount(() => {
		localStorage.setItem('userId', localStorage.getItem('userId') || crypto.randomUUID());
	});
</script>

<svelte:head>
	<script defer src="../../node_modules/@fortawesome/fontawesome-free/js/all.min.js"></script>
	<title>Rolland Gamos</title>
</svelte:head>

<slot />
