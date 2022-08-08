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
exports.handleStart = void 0;
const sendRoomUpdate_1 = require("../sendRoomUpdate");
const index_1 = require("../index");
const nextTurn_1 = require("../nextTurn");
const start_1 = require("../music/start");
function handleStart(ws, data) {
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
        // Check if user is in the room and the host
        const room = index_1.rooms.get(body.roomId);
        if (!(room === null || room === void 0 ? void 0 : room.players.find(player => player.userId === body.userId))
            || (room === null || room === void 0 ? void 0 : room.players.findIndex(player => player.userId === body.userId)) != room.hostPlayerIndex) {
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
                    message: `Room ${body.roomId} is starting on TV mode with only ${room.players.length} players.`,
                }
            };
            ws.send(JSON.stringify(response));
            return;
        }
        console.log(`Starting game in room ${body.roomId}`);
        // Start game
        room.currentPlayerIndex = 0;
        room.currentTurn = 1;
        room.currentTurnStartTime = Date.now() + 3000;
        room.currentPlayerHasGuessed = false;
        room.currentPlayerHasAttemptedGuess = false;
        room.enteredArtists = [yield (0, start_1.start)(room.playlistStart.url)];
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
exports.handleStart = handleStart;
//# sourceMappingURL=handleStart.js.map