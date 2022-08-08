"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleJoin = void 0;
const index_1 = require("../index");
const sendRoomUpdate_1 = require("../sendRoomUpdate");
function handleJoin(ws, data) {
    var _a;
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
    // Check if player is already in room
    const room = index_1.rooms.get(body.roomId);
    if (room.players.find(player => player.userId === body.userId)) {
        console.log(`Player ${body.username} with cid ${body.userId} is already in room ${body.roomId}.`);
        const response = {
            type: 'ERROR',
            body: {
                message: `Player ${body.userId} is already in room ${body.roomId}.`,
            }
        };
        ws.send(JSON.stringify(response));
        return;
    }
    // Check if username is empty
    if (!body.username) {
        const response = {
            type: 'ERROR',
            body: {
                message: `A player tried to join room ${body.roomId} without username.`,
            }
        };
        ws.send(JSON.stringify(response));
        return;
    }
    // Check if username already exist if so add a number to the end
    let username = body.username;
    let i = 1;
    while (room.players.find(player => player.username === username)) {
        username = `${body.username}(${i})`;
        i++;
    }
    // Check if game has already started
    if (room.currentTurn !== 0) {
        (_a = room.spectators) === null || _a === void 0 ? void 0 : _a.push({
            userId: body.userId,
            username: username,
            ws: ws
        });
        console.log(`${body.userId} joined room ${body.roomId} as spectator`);
    }
    else {
        // Add player to room
        room.players.push({
            userId: body.userId,
            username: username,
            ws: ws,
        });
        console.log(`${body.userId} joined room ${body.roomId}`);
    }
    // Send response
    (0, sendRoomUpdate_1.sendRoomUpdate)(body.roomId, room);
}
exports.handleJoin = handleJoin;
//# sourceMappingURL=handleJoin.js.map