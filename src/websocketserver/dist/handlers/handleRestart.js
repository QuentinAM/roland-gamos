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
exports.handleRestart = void 0;
const sendRoomUpdate_1 = require("../sendRoomUpdate");
const nextTurn_1 = require("../nextTurn");
const start_1 = require("../music/start");
const index_1 = require("../index");
function handleRestart(ws, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = data.body;
        const room = index_1.rooms.get(body.roomId);
        // Check if room exists
        if (!room) {
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
        // Reset tracks
        room.enteredArtists = [];
        room.tracks = [];
        // Check if user is in the room and the host
        if (!(room === null || room === void 0 ? void 0 : room.players.find(player => player.userId === body.userId))
            || body.userId != room.hostPlayerId) {
            console.log(`User ${body.userId} is not the host of room ${body.roomId}.`);
            const response = {
                type: 'ERROR',
                body: {
                    message: `User ${body.userId} is not the host of room ${body.roomId}.`,
                }
            };
            ws.send(JSON.stringify(response));
            return;
        }
        // Check if more than 2 players for TV mode
        if (room.mode === 'TV' && room.players.length <= 2) {
            const response = {
                type: 'ERROR',
                body: {
                    message: `Room ${body.roomId} is restarting on TV mode with only ${room.players.length} players.`,
                }
            };
            ws.send(JSON.stringify(response));
            return;
        }
        console.log(`Restarting game in room ${body.roomId} in mode ${room.mode}.`);
        // Restart game
        room.eliminatedPlayers = [];
        room.currentPlayerIndex = 0;
        room.currentTurn = 1;
        room.currentTurnStartTime = Date.now() + 5000;
        room.currentPlayerHasGuessed = false;
        room.currentPlayerHasAttemptedGuess = false;
        room.currentGuess = '';
        room.enteredArtists = [yield (0, start_1.start)(room.playlistStart.url)];
        room.isGameOver = false;
        room.gameNumber = room.gameNumber + 1;
        if (room.mode === undefined) {
            room.mode = 'NORMAL';
        }
        if (room.playlistStart === undefined) {
            room.playlistStart = {
                url: "https://open.spotify.com/playlist/4l1CEhc7ZPbaEtiPdCSGbl",
                name: 'RAP FR',
            };
        }
        // If is tv mode, eliminate the host
        if (room.mode === 'TV') {
            const hostPlayer = room.players.splice(room.hostPlayerIndex, 1)[0];
            hostPlayer.turn = 0;
            room.eliminatedPlayers.push(hostPlayer);
        }
        // Send update to all players in the room
        (0, sendRoomUpdate_1.sendRoomUpdate)(body.roomId, room);
        // Set the next turn
        room.interval = setTimeout(() => {
            console.log('Out of time');
            (0, nextTurn_1.nextTurn)(body.roomId, room.currentTurn, room.currentPlayerIndex, room.gameNumber);
        }, room.timeBetweenRound * 1000 + 3000);
    });
}
exports.handleRestart = handleRestart;
//# sourceMappingURL=handleRestart.js.map