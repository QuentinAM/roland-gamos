import * as secret from './.env.json';

export async function get() {
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

    return {
        status: 200,
        body: {
            token: data.access_token
        }
    };
}