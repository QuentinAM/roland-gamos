<script lang="ts">
    import Fa from 'svelte-fa'
    import { faCopy } from '@fortawesome/free-solid-svg-icons'

    export let value: string = '';

    // Tooltip 
    let classes = 'tooltip';
    let data_tip = 'Copy to clipboard';

    const copyToClipBoard = (text: string) => {
        navigator.clipboard.writeText(text);

        // Update tooltip
        classes += ' tooltip-success';
        data_tip = 'Copied!';
    }
</script>

<div class={classes} data-tip={data_tip}>
    <button on:click={() => copyToClipBoard(value)}>
        <Fa icon={faCopy}/>
    </button>
</div>