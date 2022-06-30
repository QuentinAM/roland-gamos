<script lang="ts">

    import ClipBoard from '../components/ClipBoard/index.svelte'
    import Input from "../components/Input/index.svelte";

    // Generate a random room id
    const roomId: string = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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