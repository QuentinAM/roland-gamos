import { GetToken, GetArtistPicture } from './utils';

export async function get({ request }: { request: Request; }) {

    const { artist, token } = await Start(request.headers.get('Authorization'));

    return {
        status: 200,
        body: {
            name: artist.name,
            artistImage: await GetArtistPicture(artist.href, token)
        }
    };
}

async function Start(token: string | null): Promise<any>
{
    const response = await fetch(`https://api.spotify.com/v1/playlists/37i9dQZF1DWU4xkXueiKGW`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
        }
    });

    const data = await response.json();

    // Check for errors
    if (data.error && data.error.status === 401)
    {
        // Change headers and call again
        return Start(await GetToken());
    }

    // Take random album from playlist
    const items = data.tracks.items;
    const album = items[Math.floor(Math.random() * items.length)];
    const artists = album.track.artists;
    const artist = artists[Math.floor(Math.random() * artists.length)];

    return {
        artist: artist,
        token: token
    }
}