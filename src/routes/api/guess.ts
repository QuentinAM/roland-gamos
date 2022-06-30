const levenshtein_threshold = 2;

export async function post({ request }: { request: Request; }) {
    const body = await request.json();

    const response = await fetch(`https://api.spotify.com/v1/search?limit=1&type=track&q=${body.guess}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + body.token,
            'Content-Type': 'application/json',
        }
    });

    const data = await response.json();

    const track = data.tracks.items[0];
    console.log(track);

    if (IsValid(body.guess, track.artists))
    {   
        const second_artist_guess: string = body.guess.split(',')[1].slice(1)
        const second_artist: any = track.artists.find((artist: { name: any; }) => artist.name === second_artist_guess);
        const artist_image = await GetArtistPicture(second_artist.href, body.token);

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

function IsValid(guess: string, artists: Array<any>)
{
    // Get both artists
    const guess_split: Array<string> = guess.split(",");
    const first_artist: string = guess_split[0];
    const second_artist: string = guess_split[1];

    // Check if both artists are in the list of artists
    const first_artist_found = artists.find(artist => artist.name === first_artist);
    const second_artist_found = artists.find(artist => artist.name === second_artist);

    return first_artist_found !== null && second_artist_found !== null;
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