<script lang="ts">
	export let username: string;
	export let usernameError: boolean;
	export let onSubmit: () => void;
</script>

<input
	id="username"
	type="text"
	bind:value={username}
	on:keydown={(e) => {
		if (e.key === 'Enter') {
			onSubmit();
		}
	}}
	placeholder="Pseudo"
	class="input input-bordered input-primary w-full max-w-xs"
	class:input-error={usernameError}
/>
