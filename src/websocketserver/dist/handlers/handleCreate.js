"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCreate = void 0;
const index_1 = require("../index");
const sendRoomUpdate_1 = require("../sendRoomUpdate");
function handleCreate(ws, data) {
    const body = data.body;
    // Generate a random room id
    const roomId = (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)).substring(0, 6);
    const player = {
        userId: body.userId,
        username: body.username,
        ws: ws,
    };
    index_1.rooms.set(roomId, {
        id: roomId,
        players: [player],
        hostPlayerId: player.userId,
        hostPlayerIndex: 0,
        eliminatedPlayers: [],
        enteredArtists: [],
        currentPlayerIndex: 0,
        currentTurn: 0,
        currentTurnStartTime: 0,
        currentPlayerHasGuessed: false,
        currentPlayerHasAttemptedGuess: false,
        currentGuess: '',
        tracks: [],
        mode: 'NORMAL',
        timeBetweenRound: 30,
        playlistStart: {
            url: "https://open.spotify.com/playlist/3vZYzaSfr9HvjaIivjHyAC",
            name: 'RAP FR'
        },
        isGameOver: false,
        spectators: [],
        winsArray: {},
        gameNumber: 1
    });
    console.log(`${body.userId} created room ${roomId}`);
    // Send response
    const room = index_1.rooms.get(roomId);
    (0, sendRoomUpdate_1.sendRoomUpdate)(roomId, room);
}
exports.handleCreate = handleCreate;
//# sourceMappingURL=handleCreate.js.map