import { RestartMessage, ErrorResponse } from '../wstypes';
import { WebSocket } from 'ws';
import { sendRoomUpdate } from '../sendRoomUpdate';
import { nextTurn } from '../nextTurn';
import { start } from '../music/start';
import { rooms } from '../index';

export async function handleRestart(ws: WebSocket, data: RestartMessage) {
    const body = data.body;

    const room = rooms.get(body.roomId);

    // Check if room exists
    if (!room) {
        console.log(`Room ${body.roomId} does not exist.`);

        const response: ErrorResponse = {
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
    if (!room?.players.find(player => player.userId === body.userId)
        || body.userId != room.hostPlayerId) {
        console.log(`User ${body.userId} is not the host of room ${body.roomId}.`);

        const response: ErrorResponse = {
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
        const response: ErrorResponse = {
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
    room.currentTurnStartTime = Date.now() + 5_000;
    room.currentPlayerHasGuessed = false;
    room.currentPlayerHasAttemptedGuess = false;
    room.currentGuess = '';
    room.enteredArtists = [await start(room.playlistStart.url)];
    room.isGameOver = false;
    room.gameNumber = room.gameNumber + 1;
    
    if (room.mode === undefined){
        room.mode = 'NORMAL';
    }

    if (room.playlistStart === undefined){
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
    sendRoomUpdate(body.roomId, room);
    // Set the next turn
    room.interval = setTimeout(() => {
        console.log('Out of time');
        nextTurn(body.roomId, room.currentTurn, room.currentPlayerIndex, room.gameNumber);
    }, room.timeBetweenRound * 1000 + 3_000);
}
