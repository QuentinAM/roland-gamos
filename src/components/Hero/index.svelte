<script>
    import Input from "../Input/index.svelte";
</script>

<div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col lg:flex-row-reverse">
        <div class="text-center lg:text-left">
            <h1 class="text-5xl font-bold">
                Roland Gamos
            </h1>
            <p class="py-6">
                Challenge your friends to a ping pong featuring rap game.
            </p>
        </div>
        <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
            <div class="card-body">
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Create room</span>
                        <input class="hidden"/> <!-- Otherwise svelte cry -->
                    </label>
                    <Input placeholder='ROOM_NAME'/>
                    <div class="form-control mt-6">
                        <button class="btn btn-primary">Create room</button>
                    </div>
                </div>
                <div class="divider"></div> 
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Join room</span>
                        <input class="hidden"/> <!-- Otherwise svelte cry -->
                    </label>
                    <Input placeholder='ROOM_ID'/>
                    <div class="form-control mt-6">
                        <button class="btn btn-primary">Join room</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>