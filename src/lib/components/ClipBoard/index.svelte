<script lang="ts">
	export let value: string = '';

	// Tooltip
	let classes = 'tooltip';
	let data_tip = 'Copier';

	const copyToClipBoard = (text: string) => {
		navigator.clipboard.writeText(text);

		// Update tooltip
		classes += ' tooltip-success';
		data_tip = 'Copié!';
	};
</script>

<div class={classes} data-tip={data_tip}>
	<button on:click={() => copyToClipBoard(value)}>
		<i class="fa-solid fa-copy" />
	</button>
</div>
