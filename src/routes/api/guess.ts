import { GetToken, GetArtistPicture } from "./utils";
const levenshtein_threshold = 2;

export async function post({ request }: { request: Request; }): Promise<any>
{
    const body = await request.json();

    // Get both artists
    const guess_split: Array<string> = body.guess.split(",");
    const first_artist: string = guess_split[0];
    const second_artist: string = guess_split[1];

    const { track, token } = await GuessEndpoint(first_artist, second_artist, request.headers.get('Authorization'));    

    if (track && IsValid(first_artist, second_artist, track.artists))
    {   
        const second_artist_obj: any = track.artists.find((artist: { name: any; }) => levenshtein(artist.name, second_artist) <= levenshtein_threshold);
        const artist_image = await GetArtistPicture(second_artist_obj.href, token);

        return {
            status: 200,
            body: {
                name: track.name,
                trackImage : track.album.images[0].url,
                releaseDate: track.album.release_date,
                previewUrl: track.preview_url,
                artistImage : artist_image
            }
        };
    }
    else
    {
        return {
            status: 404
        }
    }
}

async function GuessEndpoint(first_artist: string, second_artist: string, token: string | null): Promise<any>
{
    const response = await fetch(`https://api.spotify.com/v1/search?limit=1&type=track&q=${`${first_artist} ${second_artist}`}`, {
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
        return GuessEndpoint(first_artist, second_artist, await GetToken());
    }

    return {
        track: data.tracks.items[0],
        token: token
    }
}

function IsValid(first_artist: string, second_artist: string, artists: Array<any>)
{
    // Check if both artists are in the list of artists
    const first_artist_found = artists.find(artist => levenshtein(artist.name, first_artist) <= levenshtein_threshold);
    const second_artist_found = artists.find(artist => levenshtein(artist.name, second_artist) <= levenshtein_threshold);
    return first_artist_found !== undefined && second_artist_found !== undefined;
}

function levenshtein(s: string, t: string)
{
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