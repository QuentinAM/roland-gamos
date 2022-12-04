<script lang="ts">
	export let autoplay = false;
	export let number: string | undefined;
	export let imgUrl: string;
	export let title: string;
	export let releaseDate: string;
	export let audioUrl: string | undefined;
	export let artist1artistImage: string | undefined;
	export let artist2artistImage: string | string[] | undefined;
	export let artist1Name: string | string[] | undefined;
	export let artist2Name: string | undefined;
	let audio: any;

	const fadeAudio = () => {
		const fadeAudioInterval = setInterval(() => {
			if (!audio) {
				clearInterval(fadeAudioInterval);
				return;
			}

			const fadePoint = audio.duration - 5;
			if (audio.currentTime >= fadePoint && audio.volume !== 0) {
				audio.volume -= 0.1;
			}

			if (audio.volume < 0.003) {
				clearInterval(fadeAudioInterval);
			}
		}, 200);
	};
</script>

<div class="card card-compact w-full lg:w-96 bg-base-100 shadow-xl">
	<figure>
		<img src={imgUrl} class="lg:w-[640px] lg:h-[400px] w-[240px] h-[240px]" alt="e" />
	</figure>
	{#if number}
		<div
			class="absolute top-2 left-2 p-1 bg-primary rounded-full ring ring-primary ring-offset-base-100 ring-offset-2"
		>
			<h1 class="text-base font-semibold">{number}</h1>
		</div>
	{/if}
	<div class="card-body">
		<h2 class="card-title truncate">{title}</h2>
		{#if Array.isArray(artist1Name) && Array.isArray(artist2Name)}
			<p class="-mt-3">
				{#each artist1Name as artist}
					<span>{artist},</span>
				{/each}
				{#each artist2Name as artist}
					<span>{artist}</span>
				{/each}
			</p>
		{:else}
			<p class="-mt-3">{artist1Name} & {artist2Name}</p>
		{/if}
		<p>{releaseDate}</p>
	</div>
	{#if audioUrl}
		<audio
			class="w-full"
			src={audioUrl}
			controls
			{autoplay}
			bind:this={audio}
			on:play={() => {
				fadeAudio();
			}}
		>
			<track kind="captions" />
		</audio>
	{/if}
	<div class="avatar-group absolute bottom-10 right-0 -space-x-3">
		{#if artist1artistImage}
			<div class="avatar">
				<div class="w-12">
					<img src={artist1artistImage} alt="artist1" />
				</div>
			</div>
		{/if}
		{#if artist2artistImage}
			<div class="avatar">
				<div class="w-12">
					<img src={artist2artistImage} alt="artist1" />
				</div>
			</div>
		{/if}
	</div>
</div>
