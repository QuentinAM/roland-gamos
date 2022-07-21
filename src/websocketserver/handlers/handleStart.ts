import { WebSocket } from 'ws';
import { sendRoomUpdate } from '../sendRoomUpdate';
import { StartMessage, ErrorResponse } from '../wstypes';
import { rooms } from '../index';
import { nextTurn } from '../nextTurn';
import { start } from '../music/start';

export async function handleStart(ws: WebSocket, data: StartMessage) {
    const body = data.body;

    // Check if room exists
    if (!rooms.has(body.roomId)) {
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

    // Check if user is in the room and the host
    const room = rooms.get(body.roomId);
    if (!room?.players.find(player => player.userId === body.userId)
        || room?.players.findIndex(player => player.userId === body.userId) != room.hostPlayerIndex) {
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
    room.currentTurnStartTime = Date.now() + 3_000;
    room.currentPlayerHasGuessed = false;
    room.currentPlayerHasAttemptedGuess = false;
    room.enteredArtists = [await start(room.playlistStart.url)];

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
