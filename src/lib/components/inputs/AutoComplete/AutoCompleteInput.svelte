<script lang="ts">
    import AutoCompleteChoice from './AutoCompleteChoice.svelte';

    export let guess: string;
    export let placeholder: string;
    export let onInput: any;
    export let onValidate: any;
    export let currentPlayerHasAttemptedGuess: boolean | undefined;

    let data: any = [];   
    let filtered: any[] = [];
    let searchInput: HTMLInputElement;
    let selectionIndex: number = 0;
    let inputSet = false;

    const filter = async () => {

        if (!guess) {
            filtered = [];
            return;
        }

        data = await (await fetch('/api/autocomplete-' + guess)).json();

        let storageArr: any[] = [];
        if (guess) {
            data.forEach((artist: any) => {
                if (artist.name.toLowerCase().startsWith(guess.toLowerCase()) || artist.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").startsWith(guess.toLowerCase())) {
                    storageArr = [...storageArr, {
                        name: makeMatchBold(artist.name),
                        imageUrl: artist.imageUrl,
                    }];
                }
            });
        }
        filtered = storageArr;

        // Update index
        if (selectionIndex > filtered.length - 1) {
            selectionIndex = filtered.length - 1;
        }
    }	
    
    const clearInput = () => {
        guess = "";	
        filtered = [];
        searchInput.focus();
    }
        
    const setInputVal = (artist: any) => {
        guess = removeBold(artist.name);
        onInput();
        filtered = [];
        selectionIndex = 0;
        searchInput.focus();
    }
    
    const makeMatchBold = (str: string) => {
        const matched = str.substring(0, guess.length);
        const makeBold = `<strong>${matched}</strong>`;
        return str.replace(matched, makeBold);
    }
    
    const removeBold = (str: string) => {
        return str.replace(/<(.)*?>/g, "");
    }	
        
    const navigateList = (e: any) => {
        if (e.key === "ArrowDown")
        {
            selectionIndex++;
            if (selectionIndex >= filtered.length) {
                selectionIndex = 0;
            }
        }
        else if (e.key === "ArrowUp")
        {
            selectionIndex--;
            if (selectionIndex < 0) {
                selectionIndex = filtered.length - 1;
            }
        }
        else if (e.key === "Escape")
        {
            clearInput();
        }
        else if (e.key === "Enter")
        {
            if (inputSet){
                onValidate();
            }

            setInputVal(filtered[selectionIndex]);
            inputSet = true;
        }
        else{
            inputSet = false;
        }
    } 
</script>

<div class="w-full">
    {#if filtered.length > 0 && !currentPlayerHasAttemptedGuess}
        <ul id="autocomplete-items-list" class="">
            {#each filtered as artist, index}
                <AutoCompleteChoice {artist} lastElement={index === filtered.length - 1} highlighted={index === selectionIndex} on:click={() => setInputVal(artist)} />
            {/each}
        </ul>
    {/if}
    <input 
        id="country-input" 
        type="text" 
        {placeholder}
        class="input input-primary w-full rounded-r-none"
        bind:this={searchInput}
        bind:value={guess}
        on:input={() => {
            filter();
            onInput();
        }}
        on:keydown={navigateList}
        disabled={currentPlayerHasAttemptedGuess}
    />
</div>