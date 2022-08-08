"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRoomUpdate = void 0;
function sendRoomUpdate(roomId, room) {
    var _a, _b;
    let resRoom = Object.assign({}, room);
    resRoom.interval = undefined;
    resRoom.players = (_a = resRoom.players) === null || _a === void 0 ? void 0 : _a.map(player => {
        return { userId: player.userId, username: player.username, turn: player.turn };
    });
    resRoom.eliminatedPlayers = (_b = resRoom.eliminatedPlayers) === null || _b === void 0 ? void 0 : _b.map(player => {
        return { userId: player.userId, username: player.username, turn: player.turn };
    });
    const response = {
        type: 'UPDATE',
        body: {
            room: resRoom,
        }
    };
    room.players.forEach(player => {
        var _a;
        if (!player.ws)
            console.log(`Player ${player.username} with cid ${player.userId} has no ws.`);
        (_a = player.ws) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(response));
    });
    room.eliminatedPlayers.forEach(player => {
        var _a;
        if (!player.ws)
            console.log(`Eliminated Player ${player.username} with cid ${player.userId} has no ws.`);
        (_a = player.ws) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(response));
    });
}
exports.sendRoomUpdate = sendRoomUpdate;
//# sourceMappingURL=sendRoomUpdate.js.map