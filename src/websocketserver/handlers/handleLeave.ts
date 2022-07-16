import { WebSocket } from 'ws';
import { LeaveMessage, ErrorResponse, UpdateResponse } from '../wstypes';
import { rooms } from '../index';
import { sendRoomUpdate } from '../sendRoomUpdate';

export function handleLeave(ws: WebSocket, data: LeaveMessage) {
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

    // Check if user is in room
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

    // Remove user from room
    room.players = room.players.filter(player => player.userId !== body.userId);
    console.log(`User ${body.userId} left room ${body.roomId}.`);

    // If no players left, destroy room
    if (room.players.length === 0) {
        console.log(`Room ${body.roomId} is empty, deleting...`);
        rooms.delete(body.roomId);
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
    sendRoomUpdate(body.roomId, room);
}
