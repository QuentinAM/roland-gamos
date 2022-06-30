<script lang="ts">
    export let img_src: string = '';
    export let title: string = '';
    export let release_date: string = '';
    export let audio_src: string = '';
    export let artist1_src: string = '';
    export let artist2_src: string = '';
</script>

<div class="card card-compact w-96 bg-base-100 shadow-xl">
    <figure>
        <img src={img_src} alt="Shoes"/>
    </figure>
    <div class="card-body">
        <h2 class="card-title">{title}</h2>
        <p>{release_date}</p>
    </div>
    <audio
        class="w-full"
        src={audio_src}
        controls>
        <track kind="captions"/>
    </audio>
    <div class="avatar-group absolute bottom-10 right-0 -space-x-3">
        <div class="avatar">
            <div class="w-12">
                <img src={artist1_src} alt='artist1'/>
            </div>
        </div>
        <div class="avatar">
            <div class="w-12">
                <img src={artist2_src} alt='artist2'/>
            </div>
        </div>
    </div>
</div>