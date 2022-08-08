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
exports.handleGuessing = void 0;
const sendRoomUpdate_1 = require("../sendRoomUpdate");
const index_1 = require("../index");
const autocomplete_1 = require("../music/autocomplete");
function handleGuessing(ws, data) {
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
        // Send back autocomplete
        const response = {
            type: 'AUTOCOMPLETE',
            body: {
                artists: yield (0, autocomplete_1.autoComplete)(body.currentGuess),
            }
        };
        ws.send(JSON.stringify(response));
        // Send update to all players in the room
        room.currentGuess = body.currentGuess;
        (0, sendRoomUpdate_1.sendRoomUpdate)(body.roomId, room);
    });
}
exports.handleGuessing = handleGuessing;
//# sourceMappingURL=handleGuessing.js.map