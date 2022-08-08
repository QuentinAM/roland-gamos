"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSetting = void 0;
const sendRoomUpdate_1 = require("../sendRoomUpdate");
const index_1 = require("../index");
function handleSetting(ws, data) {
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
    // Check if user is host
    if (room.hostPlayerId !== body.userId) {
        console.log(`User ${body.userId} is not the host in room ${body.roomId}.`);
        const response = {
            type: 'ERROR',
            body: {
                message: `User ${body.userId} is not the host in room ${body.roomId}.`,
            }
        };
        ws.send(JSON.stringify(response));
        return;
    }
    // Send update to all players in the room
    room.mode = body.mode;
    room.timeBetweenRound = body.timeBetweenRound;
    room.playlistStart = body.playlistStart;
    (0, sendRoomUpdate_1.sendRoomUpdate)(body.roomId, room);
}
exports.handleSetting = handleSetting;
//# sourceMappingURL=handleSetting.js.map