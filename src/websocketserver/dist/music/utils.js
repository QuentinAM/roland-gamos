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
exports.getArtistPicture = exports.getToken = exports.spToken = void 0;
exports.spToken = "";
function getToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
        const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
        const response = yield fetch(`https://accounts.spotify.com/api/token`, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'grant_type': 'client_credentials'
            })
        });
        const data = yield response.json();
        exports.spToken = data.access_token;
        return data.access_token;
    });
}
exports.getToken = getToken;
function getArtistPicture(request, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(request, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
            }
        });
        const data = yield response.json();
        return data.images.length > 0 ? data.images[0].url : {};
    });
}
exports.getArtistPicture = getArtistPicture;
//# sourceMappingURL=utils.js.map