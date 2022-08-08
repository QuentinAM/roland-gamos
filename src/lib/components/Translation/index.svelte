<script lang="ts">
    import { language } from '$lib/language/util';
    import data from '$lib/language/translation.json';
    import { onMount } from 'svelte';

    export let id: string;
    const dataset: {
        [key: string]: {
            [key: string]: string;
        } 
    } = data;

    let word: string;

    function changeWord() {
        word = dataset[$language] ? dataset[$language][id] : "";
    }

    onMount(() => {
        language.subscribe(changeWord);
    });

</script>

{word}