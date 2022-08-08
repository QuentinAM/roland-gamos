"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.guess = void 0;
const utils_1 = require("./utils");
const levenshtein_threshold = 2;
function guess(guess) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get both artists
        const guess_split = guess.split(",");
        const first_artist = guess_split[0];
        const second_artist = guess_split[1];
        let { track, track2, token } = yield GuessEndpoint(first_artist, second_artist, 'FR', utils_1.spToken);
        if (!track) {
            return;
        }
        let res = yield CheckTrack(track, first_artist, second_artist, token);
        if (!res) {
            res = yield CheckTrack(track2, first_artist, second_artist, token);
        }
        if (!res) {
            console.log('Re-attempting guess all around the world for', first_artist, second_artist);
            const response = yield GuessEndpoint(first_artist, second_artist, null, utils_1.spToken);
            track = response.track;
            track2 = response.track2;
            token = response.token;
        }
        if (!track) {
            return;
        }
        res = yield CheckTrack(track, first_artist, second_artist, token);
        if (!res) {
            res = yield CheckTrack(track2, first_artist, second_artist, token);
        }
        return res;
    });
}
exports.guess = guess;
function CheckTrack(track, first_artist, second_artist, token) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!track)
            return;
        const feat = IsValid(first_artist, second_artist, track.artists);
        if (track && feat[0] && feat[1]) {
            const second_artist_obj = feat[1];
            const artist_image = yield (0, utils_1.getArtistPicture)(second_artist_obj.href, token);
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
    });
}
function GuessEndpoint(first_artist, second_artist, market, token) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = encodeURI(`https://api.spotify.com/v1/search?limit=2&type=track${market !== null ? `&market=${market}` : ''}&q=${`${first_artist} ${second_artist}`}`);
        const response = yield fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
            }
        });
        const data = yield response.json();
        // Check for errors
        if (data.error && data.error.status === 401 || data.error && data.error.status === 400) {
            // Change headers and call again
            return GuessEndpoint(first_artist, second_artist, market, yield (0, utils_1.getToken)());
        }
        return {
            track: data.tracks.items[0],
            track2: data.tracks.items[1],
            token: token
        };
    });
}
function IsValid(first_artist, second_artist, artists) {
    // Check if both artists are in the list of artists
    const first_artist_found = artists.find(artist => levenshtein(FormatName(artist.name), FormatName(first_artist)) <= levenshtein_threshold);
    const second_artist_found = artists.find(artist => levenshtein(FormatName(artist.name), FormatName(second_artist)) <= levenshtein_threshold);
    return [first_artist_found, second_artist_found];
}
function FormatName(name) {
    // Lowercase
    name = name.toLowerCase();
    // Remove spaces
    name = name.replace(' ', '');
    // Remove accents
    name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    return name;
}
function levenshtein(s, t) {
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
//# sourceMappingURL=guess.js.map