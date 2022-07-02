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

    // Reset players
    room.eliminatedPlayers.forEach(p => {
        room.players.push(p);
    });
    room.eliminatedPlayers = [];
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

    console.log(`Starting game in room ${body.roomId}`);

    // Retart game
    room.currentPlayerIndex = 0;
    room.currentTurn = 1;
    room.currentTurnStartTime = Date.now() + 5000;
    room.currentPlayerHasGuessed = false;
    room.currentPlayerHasAttemptedGuess = false;
    room.currentGuess = '';
    room.enteredArtists = [await start(body.playlistStart)];
    room.playlistStart = body.playlistStart;

    // Send update to all players in the room
    sendRoomUpdate(body.roomId, room);
    // Set the next turn
    room.interval = setInterval(() => {
        nextTurn(body.roomId, room.currentTurn, room.currentPlayerIndex);
    }, 30_000);
}
