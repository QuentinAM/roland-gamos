import { Artist } from "../wstypes";
import { spToken, getToken } from "./utils";

export async function autoComplete(input: string): Promise<Artist[]> {

    if (!input) return [];

    // Get both artists
    let { artists }: { artists: any[] } = await autoCompleteEndpoint(input, spToken);

    // Filter list
    // If two arists have the same name, take the one with more followers
    for (let i = 0; i < artists.length; i++) {
        for (let j = i + 1; j < artists.length; j++) {
            if (artists[i].name === artists[j].name && i != j) {
                if (artists[i].followers.total > artists[j].followers.total) {
                    artists.splice(j, 1);
                }
                else {
                    artists.splice(i, 1);
                }
            }
        }
    }

    // Now filter list by input
    artists = artists.filter(artist => FormatName(artist.name).startsWith(FormatName(input)));

    // Only keep name and one images
    artists = artists.map(artist => {
        return {
            name: artist.name,
            imageUrl: artist.images.length > 0 ? artist.images[0].url : ''
        }
    });

    return artists;
}

function FormatName(name: string) {
    // Lowercase
    name = name.toLowerCase();

    // Remove spaces
    name = name.replace(' ', '');

    // Remove accents
    name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

    return name;
}

async function autoCompleteEndpoint(input: string, token: string | null): Promise<any> {
    let url = encodeURI(`https://api.spotify.com/v1/search?limit=3&market=FR&type=artist&q=${input}`);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
        }
    });

    const data = await response.json() as any;

    // Check for errors
    if (data.error && data.error.status === 401 || data.error && data.error.status === 400) {
        // Change headers and call again
        return autoCompleteEndpoint(input, await getToken());
    }

    return {
        artists: data?.artists?.items ? data.artists.items : []
    }
}