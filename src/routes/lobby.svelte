<script lang="ts">
    import ClipBoard from '../components/ClipBoard/index.svelte'

    import { onMount } from 'svelte/internal';

    let roomId: string = '';
    
    onMount(() => {
        const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
        const idParams: string | null = urlParams.get('id');
        
        if (!idParams || idParams?.length !== 20)
        {
            window.location.href = '/';
        }
        else
        {
            roomId = idParams;
        }
    });
</script>

<div class="hero min-h-screen bg-base-200">
    <div class="hero-content text-center">
        <div>
            <h1 class="text-5xl font-bold">
                Room: {roomId}
                <ClipBoard value={roomId}/>
            </h1>
            <p class="py-6">
                Send this room id to a friend and start challenging !    
            </p>
            <button class="btn btn-primary btn-disabled">
                Waiting for opponent...
            </button>
        </div>
    </div>
</div>