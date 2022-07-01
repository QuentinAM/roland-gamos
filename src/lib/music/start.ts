import type { Artist } from 'src/websocketserver/wstypes';
import { getToken, getArtistPicture } from './utils';

export async function start(token: string | null): Promise<Artist> {
    const response = await fetch(`https://api.spotify.com/v1/playlists/37i9dQZF1DWU4xkXueiKGW`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
        }
    });

    const data = await response.json();

    // Check for errors
    if (data.error && data.error.status === 401) {
        // Change headers and call again
        return start(await getToken());
    }

    // Take random album from playlist
    const items = data.tracks.items;
    const album = items[Math.floor(Math.random() * items.length)];
    const artists = album.track.artists;
    const artist = artists[Math.floor(Math.random() * artists.length)];

    return {
        name: artist.name,
        imageUrl: await getArtistPicture(artist.href, token)
    }
}