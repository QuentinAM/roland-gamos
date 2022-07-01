import { WebSocket } from 'ws';
import { sendRoomUpdate } from '../sendRoomUpdate';
import { GuessingMessage, ErrorResponse } from '../wstypes';
import { rooms } from '../index';

export function handleGuessing(ws: WebSocket, data: GuessingMessage) {
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

    // Check if user is in the room
    const room = rooms.get(body.roomId);
    if (!room?.players.find(player => player.userId === body.userId)) {
        console.log(`User ${body.userId} is not in room ${body.roomId}.`);

        const response: ErrorResponse = {
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

        const response: ErrorResponse = {
            type: 'ERROR',
            body: {
                message: `User ${body.userId} is not the current player in room ${body.roomId}.`,
            }
        };

        ws.send(JSON.stringify(response));
        return;
    }

    // Send update to all players in the room
    room.currentGuess = body.currentGuess;
    sendRoomUpdate(body.roomId, room);
}
