import type { Artist } from '../wstypes';
import { getToken, getArtistPicture } from './utils';

export async function start(playlistStart: string | undefined, token?: string): Promise<Artist> {
    // Get playlist id by splitig playlistStart with '/'
    const playlist_split = playlistStart?.split('/');

    if (playlist_split === undefined)
    {
        return {
            name: 'Nekfeu',
            imageUrl: ''
        }
    }

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_split[playlist_split?.length - 1]}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
        }
    });

    const data = await response.json() as any;

    // Check for errors
    if (data.error && data.error.status === 401) {
        // Change headers and call again
        return start(playlistStart, await getToken());
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