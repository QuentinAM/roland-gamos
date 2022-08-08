import type { Track } from "../wstypes";
import { getToken, getArtistPicture, spToken } from "./utils";
const levenshtein_threshold = 2;

export async function guess(guess: string): Promise<Track | undefined> {
    // Get both artists
    const guess_split: Array<string> = guess.split(",");
    const first_artist: string = guess_split[0];
    const second_artist: string = guess_split[1];

    let { track, track2, token } = await GuessEndpoint(first_artist, second_artist, 'FR', spToken);

    if (!track){
        return;
    }

    let res = await CheckTrack(track, first_artist, second_artist, token);
    if (!res)
    {
        res = await CheckTrack(track2, first_artist, second_artist, token);
    }

    if (!res){
        console.log('Re-attempting guess all around the world for', first_artist, second_artist);
        const response = await GuessEndpoint(first_artist, second_artist, null, spToken);
        track = response.track;
        track2 = response.track2;
        token = response.token;
    }

    if (!track){
        return;
    }

    res = await CheckTrack(track, first_artist, second_artist, token);
    if (!res)
    {
        res = await CheckTrack(track2, first_artist, second_artist, token);
    }

    return res;
}

async function CheckTrack(track: any, first_artist: string, second_artist: string, token: string)
{
    if (!track) return;
    const feat = IsValid(first_artist, second_artist, track.artists);
    if (track && feat[0] && feat[1]) {
        const second_artist_obj: any = feat[1];
        const artist_image = await getArtistPicture(second_artist_obj.href, token);

        return {
            name: track.name,
            trackImage: track.album.images[0].url,
            releaseDate: track.album.release_date,
            previewUrl: track.preview_url,
            artist: {
                name: second_artist_obj.name,
                imageUrl: artist_image
            }
        };
    }
    return;
}

async function GuessEndpoint(first_artist: string, second_artist: string, market: string | null, token: string | null): Promise<any> {
    let url = encodeURI(`https://api.spotify.com/v1/search?limit=2&type=track${market !== null ? `&market=${market}` : ''}&q=${`${first_artist} ${second_artist}`}`);
    
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
        return GuessEndpoint(first_artist, second_artist, market, await getToken());
    }

    return {
        track: data.tracks.items[0],
        track2: data.tracks.items[1],
        token: token
    }
}

function IsValid(first_artist: string, second_artist: string, artists: Array<any>) {
    // Check if both artists are in the list of artists
    const first_artist_found = artists.find(artist => levenshtein(FormatName(artist.name), FormatName(first_artist)) <= levenshtein_threshold);
    const second_artist_found = artists.find(artist => levenshtein(FormatName(artist.name), FormatName(second_artist)) <= levenshtein_threshold);
    return [first_artist_found, second_artist_found];
}

function FormatName(name: string){
    // Lowercase
    name = name.toLowerCase();

    // Remove spaces
    name = name.replace(' ', '');

    // Remove accents
    name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

    return name;
}

function levenshtein(s: string, t: string) {
    if (s === t) {
        return 0;
    }
    var n = s.length, m = t.length;
    if (n === 0 || m === 0) {
        return n + m;
    }
    var x = 0, y, a, b, c, d, g, h, k;
    var p = new Array(n);
    for (y = 0; y < n;) {
        p[y] = ++y;
    }

    for (; (x + 3) < m; x += 4) {
        var e1 = t.charCodeAt(x);
        var e2 = t.charCodeAt(x + 1);
        var e3 = t.charCodeAt(x + 2);
        var e4 = t.charCodeAt(x + 3);
        c = x;
        b = x + 1;
        d = x + 2;
        g = x + 3;
        h = x + 4;
        for (y = 0; y < n; y++) {
            k = s.charCodeAt(y);
            a = p[y];
            if (a < c || b < c) {
                c = (a > b ? b + 1 : a + 1);
            }
            else {
                if (e1 !== k) {
                    c++;
                }
            }

            if (c < b || d < b) {
                b = (c > d ? d + 1 : c + 1);
            }
            else {
                if (e2 !== k) {
                    b++;
                }
            }

            if (b < d || g < d) {
                d = (b > g ? g + 1 : b + 1);
            }
            else {
                if (e3 !== k) {
                    d++;
                }
            }

            if (d < g || h < g) {
                g = (d > h ? h + 1 : d + 1);
            }
            else {
                if (e4 !== k) {
                    g++;
                }
            }
            p[y] = h = g;
            g = d;
            d = b;
            b = c;
            c = a;
        }
    }

    for (; x < m;) {
        var e = t.charCodeAt(x);
        c = x;
        d = ++x;
        for (y = 0; y < n; y++) {
            a = p[y];
            if (a < c || d < c) {
                d = (a > d ? d + 1 : a + 1);
            }
            else {
                if (e !== s.charCodeAt(y)) {
                    d = c + 1;
                }
                else {
                    d = c;
                }
            }
            p[y] = d;
            c = a;
        }
        h = d;
    }

    return h;
}