import * as secret from './.env.json';

export async function GetToken() {
    const CLIENT_ID = secret.CLIENT_ID;
    const CLIENT_SECRET = secret.CLIENT_SECRET;

    const response = await fetch(`https://accounts.spotify.com/api/token`, {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Basic ' + (new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams({
                            'grant_type': 'client_credentials'
                        })
                    });
    const data = await response.json();
    return data.access_token;
}

export async function GetArtistPicture(request: string, token: string | null)
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