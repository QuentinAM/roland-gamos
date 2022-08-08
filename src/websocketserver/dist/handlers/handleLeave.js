"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLeave = void 0;
const index_1 = require("../index");
const sendRoomUpdate_1 = require("../sendRoomUpdate");
function handleLeave(ws, data) {
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
    // Check if user is in room
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
    // Remove user from room
    room.players = room.players.filter(player => player.userId !== body.userId);
    console.log(`User ${body.userId} left room ${body.roomId}.`);
    // If no players left, destroy room
    if (room.players.length === 0) {
        console.log(`Room ${body.roomId} is empty, deleting...`);
        index_1.rooms.delete(body.roomId);
        return;
    }
    // Check if host is leaving, if so determine a new one
    if (room.hostPlayerId === body.userId) {
        console.log(`Host ${body.userId} is leaving room ${body.roomId}.`);
        room.hostPlayerId = room.players[0].userId;
        room.hostPlayerIndex = 0;
    }
    // If playing and only one player go to game over screen
    if (room.players.length === 1 && room.currentTurn != 0) {
        room.isGameOver = true;
    }
    // Send response
    (0, sendRoomUpdate_1.sendRoomUpdate)(body.roomId, room);
}
exports.handleLeave = handleLeave;
//# sourceMappingURL=handleLeave.js.map