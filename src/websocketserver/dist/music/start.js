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
exports.start = void 0;
const utils_1 = require("./utils");
function start(playlistStart, token) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get playlist id by splitig playlistStart with '/'
        const playlist_split = playlistStart === null || playlistStart === void 0 ? void 0 : playlistStart.split('/');
        if (playlist_split === undefined) {
            return {
                name: 'Nekfeu',
                imageUrl: ''
            };
        }
        const response = yield fetch(`https://api.spotify.com/v1/playlists/${playlist_split[(playlist_split === null || playlist_split === void 0 ? void 0 : playlist_split.length) - 1]}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
            }
        });
        const data = yield response.json();
        // Check for errors
        if (data.error && data.error.status === 401) {
            // Change headers and call again
            return start(playlistStart, yield (0, utils_1.getToken)());
        }
        // Take random album from playlist
        const items = data.tracks.items;
        const album = items[Math.floor(Math.random() * items.length)];
        const artists = album.track.artists;
        const artist = artists[Math.floor(Math.random() * artists.length)];
        return {
            name: artist.name,
            imageUrl: yield (0, utils_1.getArtistPicture)(artist.href, token)
        };
    });
}
exports.start = start;
//# sourceMappingURL=start.js.map