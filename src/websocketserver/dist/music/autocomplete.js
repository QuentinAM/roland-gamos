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
exports.autoComplete = void 0;
const utils_1 = require("./utils");
function autoComplete(input) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!input)
            return [];
        // Get both artists
        let { artists } = yield autoCompleteEndpoint(input, utils_1.spToken);
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
            };
        });
        return artists;
    });
}
exports.autoComplete = autoComplete;
function FormatName(name) {
    // Lowercase
    name = name.toLowerCase();
    // Remove spaces
    name = name.replace(' ', '');
    // Remove accents
    name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    return name;
}
function autoCompleteEndpoint(input, token) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let url = encodeURI(`https://api.spotify.com/v1/search?limit=3&market=FR&type=artist&q=${input}`);
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
            return autoCompleteEndpoint(input, yield (0, utils_1.getToken)());
        }
        return {
            artists: ((_a = data === null || data === void 0 ? void 0 : data.artists) === null || _a === void 0 ? void 0 : _a.items) ? data.artists.items : []
        };
    });
}
//# sourceMappingURL=autocomplete.js.map