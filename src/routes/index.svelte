<script lang="ts">
	import Fa from 'svelte-fa';
	import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
	import type { CreateMessage } from 'src/websocket/wstypes';
	import { goto } from '$app/navigation';
	import { player, room } from '$lib/game/data';

	let step1 = true;
	let username: string;
	let usernameError = false;
	let roomId: string;
	function toggleSteps() {
		if (step1 && !username) {
			usernameError = true;
			return;
		}

		step1 = !step1;
	}

	async function createRoom() {
		let { websocket } = await import('$lib/websocket');

		if ($room != null) {
			room.set(null);
		}

		websocket.subscribe((ws) => {
			if (!ws) return;

			let userId = localStorage.getItem('userId') as string;

			player.set({
				userId,
				username,
				ws: undefined
			});

			let message: CreateMessage = {
				type: 'CREATE',
				body: {
					username: username,
					userId
				}
			};

			ws.send(JSON.stringify(message));

			room.subscribe((room) => {
				if (!room) return;

				goto(`/room/${room.id}`);
			});
		});
	}
</script>

<div class="hero min-h-screen">
	<div class="hero-content flex-col lg:flex-row-reverse">
		<div class="text-center lg:text-left">
			<h1 class="text-5xl font-bold w-max">Roland Gamos</h1>
			<p class="pt-6 w-max">Le jeu du meilleur jeu rap au monde.</p>
			<p class="text-sm">Jusqu'à preuve du contraire.</p>
		</div>
		<div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
			{#if step1}
				<div class="card-body">
					<div class="form-control">
						<input
							id="username"
							type="text"
							bind:value={username}
							placeholder="Pseudo"
							class="input input-bordered input-primary w-full max-w-xs"
							class:input-error={usernameError}
						/>
					</div>
					<div class="form-control">
						<button class="btn btn-primary" on:click={toggleSteps}>Continuer</button>
					</div>
				</div>
			{:else}
				<div class="card-body">
					<div class="form-control">
						<button class="btn btn-ghost" on:click={toggleSteps}>
							<Fa icon={faArrowLeft} />
						</button>
					</div>
					<div class="form-control">
						<input
							id="roomId"
							type="text"
							bind:value={roomId}
							placeholder="Code de la room"
							class="input input-bordered input-primary w-full max-w-xs"
						/>
					</div>
					<div class="form-control">
						<button class="btn btn-primary">Rejoindre une room</button>
					</div>
					<div class="divider">
						<span class="divider-text">Ou</span>
					</div>
					<div class="form-control">
						<div class="form-control">
							<button class="btn btn-primary" on:click={createRoom}>Créer une room</button>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
