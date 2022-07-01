<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import UsernameInput from '$lib/components/inputs/UsernameInput.svelte';
	import { room, player } from '$lib/game/data';
	import type { JoinMessage } from 'src/websocketserver/wstypes';
	import { onMount } from 'svelte';

	let roomId: string = $page.params.roomId;
	let error = false;

	onMount(async () => {
		if ($player) {
			joinRoom();
		}
	});

	let username: string;
	let usernameError = false;
	async function joinRoom() {
		console.log(username);

		const { websocket } = await import('$lib/websocket');
		room.set(null);
		const unsubscribeWs = websocket.subscribe((ws) => {
			if (!ws) return;

			let userId = localStorage.getItem('userId') as string;

			player.set({
				userId,
				username,
				ws: undefined
			});

			let message: JoinMessage = {
				type: 'JOIN',
				body: {
					userId,
					username,
					roomId
				}
			};

			ws.send(JSON.stringify(message));

			const unsubscribeRoom = room.subscribe((r) => {
				if (r) {
					goto(`/room/${r.id}`);
					unsubscribeWs();
					unsubscribeRoom();
					return;
				}

				error = true;
			});
		});
	}

	onMount(() => {
		username = localStorage.getItem('username') ?? '';
	});
</script>

{#if error}
	<div class="absolute p-4 w-full">
		<div class="alert alert-error shadow-lg">
			<div>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="stroke-current flex-shrink-0 h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/></svg
				>
				<span>Erreur! Cette room n'existe peut être pas.</span>
			</div>
		</div>
	</div>
{/if}
<div class="hero min-h-screen">
	<div class="hero-content text-center flex flex-col">
		{#if !$player}
			<div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
				<div class="card-body">
					<div class="form-control">
						<UsernameInput bind:username bind:usernameError onSubmit={joinRoom} />
					</div>
					<div class="form-control">
						<button class="btn btn-primary" on:click={joinRoom}>Continuer</button>
					</div>
				</div>
			</div>
		{:else}
			<div class="text-center">
				<h1 class="text-5xl font-bold">
					Entrain de rejoindre la Room
					<span class="text-secondary">
						{roomId}
					</span>
					...
				</h1>
				<p class="pt-6">Ça arrive fort.</p>
			</div>
		{/if}
	</div>
</div>
