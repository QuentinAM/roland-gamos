import { WebSocket } from 'ws';
import { sendRoomUpdate } from '../sendRoomUpdate';
import { SettingMessage, ErrorResponse } from '../wstypes';
import { rooms } from '../index';

export function handleSetting(ws: WebSocket, data: SettingMessage) {
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

    // Check if user is host
    if (room.hostPlayerId!== body.userId) {
        console.log(`User ${body.userId} is not the host in room ${body.roomId}.`);

        const response: ErrorResponse = {
            type: 'ERROR',
            body: {
                message: `User ${body.userId} is not the host in room ${body.roomId}.`,
            }
        };

        ws.send(JSON.stringify(response));
        return;
    }

    // Send update to all players in the room
    room.mode = body.mode;
    room.timeBetweenRound = body.timeBetweenRound;
    room.playlistStart = body.playlistStart;
    sendRoomUpdate(body.roomId, room);
}
