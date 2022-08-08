<script lang="ts">
	import UsernameInput from '$lib/components/inputs/UsernameInput.svelte';
	import Footer from '$lib/components/Footer/index.svelte';
	import Translation from '$lib/components/Translation/index.svelte';
	import type { CreateMessage } from 'src/websocketserver/wstypes';
	import { goto } from '$app/navigation';
	import { player, room } from '$lib/game/data';
	import { onMount } from 'svelte';
	import type { SendMessage } from '$lib/websocket';

	let sendMessage: SendMessage;
	let step1: boolean = true;
	let username: string;
	let usernameError: boolean = false;
	let roomId: string;
	let roomIdError: boolean = false;
	function toggleSteps() {
		if (step1 && !username) {
			usernameError = true;
			return;
		}

		step1 = !step1;
	}

	async function createRoom() {
		if ($room != null) {
			room.set(null);
		}

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
		sendMessage(message);

		const unsubscribeRoom = room.subscribe((room) => {
			if (!room) return;

			unsubscribeRoom();

			goto(`/room/${room.id}`);
		});
	}

	function joinRoom() {

		if (roomIdError || !roomId){
			roomIdError = true;
			return;
		}

		localStorage.setItem('username', username);
		player.set({
			username: username,
			userId: localStorage.getItem('userId') as string
		});
		goto(`/room/${roomId}`);
	}

	onMount(async () => {
		let { sm } = await import('$lib/websocket');
		sendMessage = sm;

		username = localStorage.getItem('username') ?? '';
	});
</script>

<div class="hero min-h-screen">
	<div class="hero-content flex-col lg:flex-row-reverse">
		<div class="text-center lg:text-left">
			<h1 class="text-5xl font-bold">Roland Gamos</h1>
			<p class="pt-6">Le jeu du meilleur jeu rap au monde.</p>
			<p class="text-sm">Jusqu'à preuve du contraire.</p>
			<div class="pt-5 lg:w-max text-left">
				<p class="text-base">🎵 Le but du jeu ? Un ping-pong featuring musical.</p>
				<p class="text-sm">
					🎙️ Un artiste de départ est pris dans la playlist de ton choix.
					<br/>
					🎧 Chacun votre tour vous devrez donner un feat avec l'artiste précédent.
					<br/>
					⚠️ Un artiste ne peut être cité qu'une fois !
					<br/>
					🥇 Que le meilleur gagne !
				</p>
			</div>
		</div>
		<div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
			{#if step1}
				<div class="card-body">
					<div class="form-control">
						<UsernameInput bind:username bind:usernameError onSubmit={toggleSteps} />
					</div>
					<div class="form-control">
						<button class="btn btn-primary" on:click={toggleSteps}><Translation id="continue"/></button>
					</div>
				</div>
			{:else}
				<div class="card-body">
					<div class="form-control">
						<button class="btn btn-ghost" on:click={toggleSteps}>
							<i class="fa-solid fa-arrow-left" />
						</button>
					</div>
					<div class="form-control">
						<input
							id="roomId"
							type="text"
							bind:value={roomId}
							on:change={() => roomIdError = roomId.length !== 6}
							placeholder="Code de la room"
							class:input-error={roomIdError}
							class="input input-bordered input-primary w-full max-w-xs"
						/>
					</div>
					<div class="form-control">
						<button class="btn btn-primary" on:click={joinRoom}><Translation id="join_room"/></button>
					</div>
					<div class="divider">
						<span class="divider-text"><Translation id="or"/></span>
					</div>
					<div class="form-control">
						<div class="form-control">
							<button class="btn btn-primary" on:click={createRoom}><Translation id="create_room"/></button>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
<Footer/>