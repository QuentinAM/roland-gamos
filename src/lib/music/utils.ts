export let spToken = "";

export async function getToken() {
    const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

    const response = await fetch(`https://accounts.spotify.com/api/token`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'grant_type': 'client_credentials'
        })
    });
    const data = await response.json();
    spToken = data.access_token;
    return data.access_token;
}

export async function getArtistPicture(request: string, token: string | null) {
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