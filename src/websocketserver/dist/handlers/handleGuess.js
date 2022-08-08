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
exports.handleGuess = void 0;
const nextTurn_1 = require("../nextTurn");
const sendRoomUpdate_1 = require("../sendRoomUpdate");
const index_1 = require("../index");
const guess_1 = require("../music/guess");
function handleGuess(ws, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = data.body;
        // Check if room exists
        if (!index_1.rooms.has(body.roomId)) {
            console.log(`Room ${body.roomId} does not exist.`);
            const response = {
                type: 'ERROR',
                body: {
                    message: `Room ${body.roomId} does not exist.`,
                }
            };
            ws.send(JSON.stringify(response));
            return;
        }
        // Check if user is in the room
        const room = index_1.rooms.get(body.roomId);
        if (!(room === null || room === void 0 ? void 0 : room.players.find(player => player.userId === body.userId))) {
            console.log(`User ${body.userId} is not in room ${body.roomId}.`);
            const response = {
                type: 'ERROR',
                body: {
                    message: `User ${body.userId} is not in room ${body.roomId}.`,
                }
            };
            ws.send(JSON.stringify(response));
            return;
        }
        // Check if user is the current player
        if (room.currentPlayerIndex != room.players.findIndex(player => player.userId === body.userId)) {
            console.log(`User ${body.userId} is not the current player in room ${body.roomId}.`);
            const response = {
                type: 'ERROR',
                body: {
                    message: `User ${body.userId} is not the current player in room ${body.roomId}.`,
                }
            };
            ws.send(JSON.stringify(response));
            return;
        }
        // Check if user has already attempted a guess
        if (room.currentPlayerHasAttemptedGuess) {
            console.log(`User ${body.userId} has already attempted a guess in room ${body.roomId}.`);
            const response = {
                type: 'ERROR',
                body: {
                    message: `User ${body.userId} has already attempted a guess in room ${body.roomId}.`,
                }
            };
            ws.send(JSON.stringify(response));
            return;
        }
        // Stop the current timer
        clearTimeout(room.interval);
        // Check if artist have already been said
        let already_said_artist = room.enteredArtists.find(artist => artist.name.toLowerCase().replace(' ', '') === body.guess.toLowerCase().replace(' ', '')) !== undefined;
        // Check if guess is valid
        let currentArtist = room.enteredArtists[room.enteredArtists.length - 1];
        let res;
        if (!already_said_artist) {
            res = (yield (0, guess_1.guess)(currentArtist.name + "," + body.guess));
        }
        // Send update to all players in the room
        room.currentPlayerHasAttemptedGuess = true;
        if (!already_said_artist && res) {
            console.log(`Correct guess in room ${body.roomId} by user ${body.userId}: ${body.guess} at turn ${room.currentTurn}.`);
            // Guess is correct, send update to all players in the room
            room.currentGuess = body.guess;
            room.currentPlayerHasGuessed = true;
            room.tracks.push(res);
            room.enteredArtists.push(res.artist);
            room.currentTurn = room.currentTurn + 1;
            (0, sendRoomUpdate_1.sendRoomUpdate)(body.roomId, room);
        }
        else {
            console.log(`Incorrect guess in room ${body.roomId} by user ${body.userId}: ${body.guess} at turn ${room.currentTurn}.`);
            room.currentPlayerHasGuessed = false;
            (0, sendRoomUpdate_1.sendRoomUpdate)(body.roomId, room);
        }
        setTimeout(() => {
            (0, nextTurn_1.nextTurn)(body.roomId, room.currentTurn, room.currentPlayerIndex, room.gameNumber);
            room.interval = setTimeout(() => {
                if (room.isGameOver)
                    return;
                console.log('Out of time');
                (0, nextTurn_1.nextTurn)(body.roomId, room.currentTurn, room.currentPlayerIndex, room.gameNumber);
            }, room.timeBetweenRound * 1000);
        }, 3000);
    });
}
exports.handleGuess = handleGuess;
//# sourceMappingURL=handleGuess.js.map