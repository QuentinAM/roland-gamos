export async function post({ request }: { request: Request; }) {
    const body = await request.json();

    const response = await fetch(`https://api.spotify.com/v1/playlists/37i9dQZF1DWU4xkXueiKGW`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + body.token,
            'Content-Type': 'application/json',
        }
    });

    const data = await response.json();

    // Take random album from playlist
    const artist = data.tracks.items[Math.floor(Math.random() * data.tracks.items.length)].track.artists[0];
    console.log(artist);

    return {
        status: 200,
        body: {
            name: artist.name,
            artistImage: await GetArtistPicture(artist.href, body.token)
        }
    };
}

async function GetArtistPicture(request: string, token: string)
{
    const response = await fetch(request, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
        }
    });

    const data = await response.json();
    return data.images[0].url;
}