<script>
    export let placeholder = '...';
    export let value = '';
</script>

<input type="text" bind:value={value} {placeholder} class="input input-bordered input-primary w-full max-w-xs" />