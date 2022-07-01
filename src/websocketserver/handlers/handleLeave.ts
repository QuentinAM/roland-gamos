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

    // TODO: Change host if necessary

    // Send response
    sendRoomUpdate(body.roomId, room);
}
