<script lang="ts">
	export let imgUrl: string;
	export let title: string;
	export let releaseDate: string;
	export let audioUrl: string;
	export let artist1ImageUrl: string;
	export let artist2ImageUrl: string;
</script>

<div class="card card-compact w-96 bg-base-100 shadow-xl">
	<figure>
		<img src={imgUrl} alt="Shoes" />
	</figure>
	<div class="card-body">
		<h2 class="card-title">{title}</h2>
		<p>{releaseDate}</p>
	</div>
	{#if audioUrl}
		<audio class="w-full" src={audioUrl} controls>
			<track kind="captions" />
		</audio>
	{/if}
	<div class="avatar-group absolute bottom-10 right-0 -space-x-3">
		<div class="avatar">
			<div class="w-12">
				<img src={artist1ImageUrl} alt="artist1" />
			</div>
		</div>
		<div class="avatar">
			<div class="w-12">
				<img src={artist2ImageUrl} alt="artist2" />
			</div>
		</div>
	</div>
</div>
