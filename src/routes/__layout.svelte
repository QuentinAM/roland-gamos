<script>
	import { onMount } from 'svelte';

	import '../app.css';

	onMount(() => {
		localStorage.setItem('userId', localStorage.getItem('userId') || crypto.randomUUID());
	});
</script>

<svelte:head>
	<title>Roland Gamos</title>
</svelte:head>

<slot />
