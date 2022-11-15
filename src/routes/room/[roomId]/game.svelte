<script lang="ts">
	import { onMount } from 'svelte';
	import { scale, slide, fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { room, player } from '$lib/game/data';
	import Featuring from '$lib/components/ui/Featuring.svelte';
	import PlaylistInput from '$lib/components/inputs/PlaylistInput.svelte';
	import ClipBoard from '$lib/components/ClipBoard/index.svelte';
	import AutoCompleteInput from '$lib/components/inputs/AutoComplete/AutoCompleteInput.svelte';
	import { CutTrackName } from '$lib/game/util';
	import type {
		GuessingMessage,
		GuessMessage,
		ModeType,
		RestartMessage,
		SettingMessage,
		LeaveMessage,
		Playlist
	} from 'src/websocketserver/wstypes';
	import type { SendMessage } from '$lib/websocket';
	import Timer from '$lib/components/ui/Timer.svelte';

	let sendMessage: SendMessage;
	$: turnDuration = $room?.timeBetweenRound ? $room?.timeBetweenRound * 1000 : 30_000;
	let currentTime = Date.now();
	let chosenCategory: Playlist;
	let autoplay: boolean;
	let timeBetweenRound = 30;

	$: players = $room?.players;
	$: currentTurn = $room?.currentTurn;
	$: currentGuess = $room?.currentGuess;
	$: currentArtist = $room?.enteredArtists[$room?.currentTurn - 1];
	$: currentTrack = $room?.tracks[$room?.tracks.length - 1];
	$: currentPlayerIndex = $room?.currentPlayerIndex;
	$: currentPlayerHasAttemptedGuess = $room?.currentPlayerHasAttemptedGuess;
	$: currentPlayerHasGuessed = $room?.currentPlayerHasGuessed;
	$: currentTurnStartTime = $room?.currentTurnStartTime;
	$: eliminatedPlayers = $room?.eliminatedPlayers;
	$: remainingTime = currentTurnStartTime
		? new Date(currentTurnStartTime + turnDuration - currentTime).getTime()
		: 0;
	$: remainingTimeSeconds =
		Math.floor(remainingTime / 1000) < 0 ? 0 : Math.floor(remainingTime / 1000);

	$: isCurrentPlayer =
		players && currentPlayerIndex != undefined
			? players[currentPlayerIndex]?.userId === $player?.userId
			: false;
	$: isGameOver = $room?.isGameOver;

	$: tracks = $room?.tracks;
	$: isHost = $room && $player && $room?.hostPlayerId === $player?.userId;

	$: isSpectator = $room?.spectators?.find((pl) => pl.userId === $player?.userId);

	$: modeTv = $room?.mode === 'TV';

	let guess = '';
	// Send the final guess attempt to the server
	async function submitGuess() {
		let message: GuessMessage = {
			type: 'GUESS',
			body: {
				guess: guess,
				roomId: $room?.id as string,
				userId: $player?.userId as string
			}
		};
		sendMessage(message);
		currentPlayerHasAttemptedGuess = true;
		guess = '';
	}

	// Send the current guess attempt to the server
	async function guessing() {
		let message: GuessingMessage = {
			type: 'GUESSING',
			body: {
				currentGuess: guess,
				roomId: $room?.id as string,
				userId: $player?.userId as string
			}
		};
		sendMessage(message);
	}

	async function restart() {
		let message: RestartMessage = {
			type: 'RESTART',
			body: {
				roomId: $room?.id as string,
				userId: $player?.userId as string,
				timeBetweenRound: timeBetweenRound as number
			}
		};
		sendMessage(message);
	}

	async function handleLeave() {
		// Send settings to server
		let message: LeaveMessage = {
			type: 'LEAVE',
			body: {
				roomId: $room?.id as string,
				userId: $player?.userId as string
			}
		};
		sendMessage(message);
	}

	async function updateSettings(newCategory?: Playlist) {
		if (!isHost) {
			return;
		}

		if (newCategory) {
			chosenCategory = newCategory;
		}
		// Send settings to server
		let message: SettingMessage = {
			type: 'SETTING',
			body: {
				roomId: $room?.id as string,
				userId: $player?.userId as string,
				timeBetweenRound: timeBetweenRound as number,
				mode: modeTv ? 'TV' : ('NORMAL' as ModeType),
				playlistStart: chosenCategory as Playlist
			}
		};
		sendMessage(message);
	}

	function capitalizeFirstLetter(str: string | undefined) {
		return str === undefined ? '' : str.charAt(0).toUpperCase() + str.slice(1);
	}

	onMount(async () => {
		let { sm } = await import('$lib/websocket');
		sendMessage = sm;

		// Check if a room is present
		if (!$room) {
			goto('/');
		}

		autoplay = localStorage.getItem('autoplay') === 'true' ?? true;

		// Update the remaining time every second
		setInterval(() => {
			if (!currentPlayerHasAttemptedGuess && !isGameOver) currentTime = Date.now();
		}, 1_000);
	});
</script>

<svelte:window on:beforeunload={handleLeave} />
{#if currentPlayerHasAttemptedGuess && !isGameOver}
	<Timer />
{/if}
{#if isGameOver}
	<div class="flex flex-col w-full justify-start p-4">
		<h1 class="font-bold">Partie terminée #{$room?.gameNumber}</h1>
		<div class="overflow-auto h-64">
			<table class="table w-full max-h-[50%]">
				<!-- head -->
				<thead>
					<tr class="bg-base-400">
						<th />
						<th>Joueur</th>
						<th>Dernier tour</th>
						<th>Victoires</th>
					</tr>
				</thead>
				<tbody>
					<!-- row 1 -->
					<tr>
						<th class="text-primary text-bold text-xl">1er</th>
						<td class="text-primary text-bold text-xl">{$room?.players[0].username}</td>
						<td class="text-primary text-bold text-xl">{$room?.players[0].turn}</td>
						<td class="text-bold text-xl">{$room?.winsArray[$room?.players[0].userId]}</td>
					</tr>
					{#if eliminatedPlayers}
						{#each eliminatedPlayers.reverse() as p, i}
							<tr>
								<th>{i + 2}ème</th>
								<td>{p.username}</td>
								<td>{p.turn}</td>
								<td>
									{$room?.winsArray[p.userId] ? $room?.winsArray[p.userId] : 0}
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
		<div class="flex lg:flex-row flex-col-reverse lg:space-x-4 space-y-4 w-full">
			<div class="lg:grow">
				<h1 class="font-bold">Titres joués</h1>
				<div
					class="h-[25rem] lg:h-[35rem] shadow-lg shadow-zinc-600 carousel carousel-vertical rounded-box"
				>
					{#if tracks}
						{#each tracks as track, i}
							<div class="carousel-item h-full">
								<Featuring
									number={`${i + 1}/${tracks.length}`}
									audioUrl={track.previewUrl}
									title={track.name}
									imgUrl={track.trackImage}
									releaseDate={track.releaseDate}
									artist1artistImage={track.artist.artistImage}
									artist2artistImage={$room?.enteredArtists[i]?.artistImage}
									artist1Name={track.artist.name}
									artist2Name={$room?.enteredArtists[i]?.name}
								/>
							</div>
						{/each}
					{/if}
				</div>
			</div>
			<div class="flex flex-col space-y-4 lg:grow">
				<div class="lg:ml-20">
					<h1 class="font-bold">Statistiques</h1>
					<div class="stats stats-vertical shadow w-full">
						{#if $room?.currentTurnStartTime}
							<div class="stat">
								<div class="stat-title">Durée</div>
								<div class="stat-value">
									{Math.round(((currentTurn ?? 1) * (turnDuration + 5_000)) / 1000 / 60)}
								</div>
								<div class="stat-desc">Minutes</div>
							</div>
						{/if}

						{#if tracks && tracks.length > 0}
							<div class="stat">
								<div class="stat-title">Morceau le plus ancien</div>
								<div class="stat-value truncate">
									{tracks.reduce(function (prev, curr) {
										return prev.releaseDate < curr.releaseDate ? prev : curr;
									}).name}
								</div>
								<div class="stat-desc">
									{tracks.reduce(function (prev, curr) {
										return prev.releaseDate < curr.releaseDate ? prev : curr;
									}).releaseDate}
								</div>
							</div>
						{/if}

						{#if tracks && tracks.length > 0}
							<div class="stat">
								<div class="stat-title">Morceau le plus récent</div>
								<div class="stat-value truncate">
									{tracks.reduce(function (prev, curr) {
										return prev.releaseDate > curr.releaseDate ? prev : curr;
									}).name}
								</div>
								<div class="stat-desc">
									{tracks.reduce(function (prev, curr) {
										return prev.releaseDate > curr.releaseDate ? prev : curr;
									}).releaseDate}
								</div>
							</div>
						{/if}
					</div>
				</div>
				<div class="flex flex-row justify-center space-x-3">
					<div class="form-control w-full max-w-xs">
						<PlaylistInput
							nonHostValue={$room?.playlistStart}
							onChange={(newCategory) => {
								updateSettings(newCategory);
							}}
							{isHost}
						/>
						<div class="form-control w-full max-w-xs">
							<label class="label">
								<span class="label-text">Temps de réponse ({$room?.timeBetweenRound}s)</span>
								<input class="hidden" />
							</label>
							<div
								class="tooltip tooltip-primary tooltip-right"
								data-tip="Délais avant lequel il faut donner votre réponse."
							>
								<input
									type="range"
									disabled={!isHost}
									value={isHost ? timeBetweenRound : $room?.timeBetweenRound}
									min="1"
									max="60"
									step="1"
									class="range"
									class:range-primary={isHost}
									on:input={(e) => {
										timeBetweenRound = e.target?.value;
										updateSettings();
									}}
								/>
							</div>
							<div
								class="tooltip tooltip-primary tooltip-right"
								data-tip="La partie est uniquement retransmise sur l'écran de l'host."
							>
								<label class="label">
									<span class="label-text">Mode TV</span>
									<input
										disabled={!isHost}
										type="checkbox"
										checked={modeTv}
										on:change={(e) => {
											modeTv = e.target?.checked;
											updateSettings();
										}}
										class="checkbox checkbox-primary"
									/>
								</label>
							</div>
						</div>
						<div class="flex flex-row justify-center">
							<button
								class="btn btn-error m-1 w-1/3"
								on:click={async () => {
									await handleLeave();
									goto('/');
								}}
							>
								Quitter
							</button>
							{#if $room?.hostPlayerId}
								{#if $room?.hostPlayerId === $player?.userId}
									<button
										class="btn btn-primary m-1 w-1/3"
										on:click={restart}
										disabled={$room?.players.length === 1}
									>
										Rejouer
									</button>
								{/if}
							{/if}
						</div>
					</div>
				</div>
			</div>
			<div class="flex flex-col lg:grow">
				{#if $room}
					<div class="w-full pt-2">
						<h1 class="text-4xl font-bold">
							Room:
							<span class="text-secondary">
								{$room.id}
								<ClipBoard
									value={window.location.href.substring(0, window.location.href.length - 5)}
								/>
							</span>
						</h1>
						<p>Envoie le lien à tes freros pour qu'ils puissent rejoindre!</p>
					</div>
				{/if}
				{#if $room?.players}
					<div class="card shadow-xl overflow-auto">
						<div class="card-body">
							<h2 class="text-xl font-semibold">Joueurs:</h2>
							<div class="flex flex-col items-center">
								{#each $room?.players as pl, i}
									<span
										class="inline-flex"
										class:text-primary={pl.userId === $player?.userId}
										class:font-semibold={pl.userId === $player?.userId}
									>
										{#if pl.userId === $room.hostPlayerId}
											<span class="mr-1">
												<i class="fa-solid fa-crown text-primary" />
											</span>
										{/if}
										{pl.username}
									</span>
								{/each}
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<!-- In Progress Game -->
	{#if $room?.mode === 'NORMAL' || ($room?.mode === 'TV' && isHost)}
		<div class="hero min-h-screen">
			<div class="hero-content flex lg:flex-row flex-col justify-start items-start h-full w-full">
				<div class="flex flex-col w-full justify-start">
					<div class="stats shadow" transition:slide>
						<div class="stat bg-primary md:p-4 p-2">
							<div class="stat-figure text-primary-content" />
							<div class="stat-title text-sm lg:text-xl text-primary-content">Tour</div>
							<div class="stat-value text-sm lg:text-xl text-primary-content inline-flex">
								<span class="mr-4">
									<i class="fa-solid fa-arrows-rotate" />
								</span>
								<span class="countdown">
									<span style={`--value:${currentTurn};`} />
								</span>
							</div>
						</div>
						<div class="stat bg-secondary md:p-4 p-2">
							<div class="stat-title text-sm lg:text-xl text-secondary-content">Temps Restant</div>
							<div class="stat-value text-sm lg:text-xl text-secondary-content inline-flex">
								<span class="mr-4">
									<i class="fa-solid fa-clock" />
								</span>
								<span class="countdown">
									<span style={`--value:${remainingTimeSeconds};`}>s</span>
								</span>
							</div>
						</div>
						<div class="stat bg-accent md:p-4 p-1">
							<div class="stat-title text-sm lg:text-xl text-accent-content">Artiste</div>
							<div class="stat-value text-sm lg:text-xl text-accent-content inline-flex">
								<span class="mr-4">
									<i class="fa-solid fa-music" />
								</span>
								{currentArtist?.name ?? 'Aucun'}
							</div>
						</div>
					</div>

					{#if players}
						<div
							class="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 grid-flow-row gap-8 mt-16 w-full"
						>
							{#each players as p, i}
								<div class="flex flex-col justify-center items-center" transition:scale>
									<p class="font-semibold">{p.username}</p>
									<div
										class="w-[60%] h-2 rounded"
										class:bg-primary={currentPlayerIndex === i}
										class:bg-base-300={currentPlayerIndex !== i}
									/>
									<div
										class="w-[50%] h-16 rounded-b shadow-lg"
										class:bg-primary={currentPlayerIndex === i}
										class:bg-base-300={currentPlayerIndex !== i}
									>
										{#if currentPlayerIndex === i}
											<div
												class="p-2 m-2 text-2xs text-center rounded"
												class:bg-base-100={!currentPlayerHasGuessed && remainingTimeSeconds > 0}
												class:bg-success={currentPlayerHasGuessed}
												class:bg-error={(!currentPlayerHasGuessed && remainingTimeSeconds <= 0) ||
													(currentPlayerHasAttemptedGuess && !currentPlayerHasGuessed)}
											>
												{capitalizeFirstLetter(currentGuess) || '‎'}
											</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				{#if currentTrack}
					<div class="w-full my-1" transition:slide>
						<Featuring
							{autoplay}
							number={undefined}
							audioUrl={currentTrack.previewUrl}
							artist2artistImage={$room?.enteredArtists[$room?.currentTurn - 2]?.artistImage ??
								currentArtist?.artistImage ??
								''}
							artist2Name={$room?.enteredArtists[$room?.currentTurn - 2]?.name ??
								currentArtist?.name ??
								''}
							artist1artistImage={currentTrack.artist.artistImage}
							artist1Name={currentTrack.artist.name}
							imgUrl={currentTrack.trackImage}
							releaseDate={currentTrack.releaseDate}
							title={CutTrackName(currentTrack.name)}
						/>
						<div class="form-control">
							<label class="label">
								<span class="label-text">Autoplay</span>
								<input
									type="checkbox"
									class="toggle toggle-primary"
									bind:checked={autoplay}
									on:change={() => localStorage.setItem('autoplay', autoplay ? 'true' : 'false')}
								/>
							</label>
						</div>
						{#if isSpectator && !isGameOver}
							<div>
								<h1 class="font-bold text-primary text-2xl">
									Spectateur: en attente dans la fin de la partie
								</h1>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	{/if}
	{#if isCurrentPlayer}
		<!-- Guess Input -->

		{#if $room?.mode === 'TV'}
			<div class="flex flex-row justify-center" transition:slide>
				<h1 class="font-bold text-primary text-2xl">A ton tour !</h1>
			</div>
		{/if}

		<div class="absolute bottom-0 p-1 lg:p-14 w-full" transition:scale>
			<div class="card shadow-lg bg-primary p-8">
				<div class="card-body" />
			</div>
		</div>
		<div class="absolute bottom-0 p-3 lg:p-16 w-full" transition:scale={{ delay: 100 }}>
			<div class="card shadow-lg bg-base-100">
				<div class="card-body">
					<div class="form-control flex-row">
						<div class="w-full">
							<AutoCompleteInput
								placeholder={`Entre un artiste qui a featé avec ${currentArtist?.name}.`}
								bind:guess
								onValidate={() => {
									submitGuess();
								}}
								onInput={() => {
									guessing();
								}}
								{currentPlayerHasAttemptedGuess}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
{/if}
