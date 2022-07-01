import { WebSocket } from 'ws';
import { nextTurn } from '../nextTurn';
import { sendRoomUpdate } from '../sendRoomUpdate';
import { GuessMessage, ErrorResponse, Track } from '../wstypes';
import { rooms } from '../index';
import { guess } from '../music/guess'

export async function handleGuess(ws: WebSocket, data: GuessMessage) {
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

    // Stop the current timer
    clearInterval(room.interval);

    // Check if guess is valid
    let currentArtist = room.enteredArtists[room.enteredArtists.length - 1];
    let res = await guess(currentArtist.name + "," + body.guess) as Track | undefined;


    // Send update to all players in the room
    room.currentPlayerHasAttemptedGuess = true;
    if (res) {
        console.log(`Correct guess in room ${body.roomId} by user ${body.userId}: ${body.guess}`);

        // Guess is correct, send update to all players in the room
        room.currentGuess = body.guess;
        room.currentPlayerHasGuessed = true;
        room.currentTrack = res;
        room.enteredArtists.push(res.artist);
        sendRoomUpdate(body.roomId, room);
    } else {
        room.currentPlayerHasGuessed = false;

        sendRoomUpdate(body.roomId, room);
    }

    setTimeout(() => {
        nextTurn(body.roomId, room.currentTurn, room.currentPlayerIndex);
        room.interval = setInterval(() => {
            nextTurn(body.roomId, room.currentTurn, room.currentPlayerIndex);
        }, 30_000);
    }, 5_000);
}
