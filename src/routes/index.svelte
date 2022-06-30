<script lang="ts">
	import Hero from '../lib/components/Hero/index.svelte';

	const createRoom = () => {
		// Generate a random room id
		const roomId: string =
			Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		window.location.href = `/lobby?id=${roomId.substring(0, 20)}`;
	};
</script>

<Hero {createRoom} />
