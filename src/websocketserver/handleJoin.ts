import { WebSocket } from 'ws';
import { Room, Player, UpdateResponse, JoinMessage, ErrorResponse } from './wstypes';
import { rooms, wss } from './index';

export function handleJoin(ws: WebSocket, data: JoinMessage) {
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

    // Check if player is already in room
    const room: Room = rooms.get(body.roomId) as Room;
    if (room.players.find(player => player.userId === body.userId)) {
        console.log(`Player ${body.username} with cid ${body.userId} is already in room ${body.roomId}.`);

        const response: ErrorResponse = {
            type: 'ERROR',
            body: {
                message: `Player ${body.username} is already in room ${body.roomId}.`,
            }
        };

        ws.send(JSON.stringify(response));
        return;
    }

    // Add player to room
    room.players.push({
        userId: body.userId,
        username: body.username,
        ws: ws,
    });

    console.log(`${body.username} joined room ${body.roomId}`);

    const response: UpdateResponse = {
        type: 'UPDATE',
        body: {
            room: rooms.get(body.roomId) as Room,
        }
    };

    // Remove ws before sending response
    response.body.room.players.forEach((player: Player) => {
        delete player.ws;
    });

    // Send response
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(response));
        }
    });
}
