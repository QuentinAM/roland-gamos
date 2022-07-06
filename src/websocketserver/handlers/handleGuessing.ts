import { WebSocket } from 'ws';
import { sendRoomUpdate } from '../sendRoomUpdate';
import { GuessingMessage, ErrorResponse, AutocompleteResponse } from '../wstypes';
import { rooms } from '../index';
import { autoComplete } from '../music/autocomplete';

export async function handleGuessing(ws: WebSocket, data: GuessingMessage) {
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

    // Check if user has already attempted a guess
    if (room.currentPlayerHasAttemptedGuess) {
        console.log(`User ${body.userId} has already attempted a guess in room ${body.roomId}.`);

        const response: ErrorResponse = {
            type: 'ERROR',
            body: {
                message: `User ${body.userId} has already attempted a guess in room ${body.roomId}.`,
            }
        };

        ws.send(JSON.stringify(response));
        return;
    }

    // Send back autocomplete
    const response: AutocompleteResponse = {
        type: 'AUTOCOMPLETE',
        body: {
            artists: await autoComplete(body.currentGuess),
        }
    };
    ws.send(JSON.stringify(response));
    

    // Send update to all players in the room
    room.currentGuess = body.currentGuess;
    sendRoomUpdate(body.roomId, room);
}
