<script context="module">
    export function load({ error, status }) {
        return {
            props: {
                message: error.message,
                status // same as status: status
            }
        };
    }
</script>

<script>
// @ts-nocheck

    export let message;
    export let status;
</script>
  
{#if status == 404}
    <h1>{message}</h1>
{:else}
    <h1>{message}</h1>
{/if}