import { WebSocket } from 'ws';
import { Room, Player, JoinMessage, ErrorResponse } from '../wstypes';
import { rooms, wss } from '../index';
import { sendRoomUpdate } from '../sendRoomUpdate';

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
                message: `Player ${body.userId} is already in room ${body.roomId}.`,
            }
        };

        ws.send(JSON.stringify(response));
        return;
    }

    // Check if username is empty
    if (!body.username) {
        const response: ErrorResponse = {
            type: 'ERROR',
            body: {
                message: `A player tried to join room ${body.roomId} without username.`,
            }
        };

        ws.send(JSON.stringify(response));
        return;
    }

    // Check if username already exist if so add a number to the end
    let username = body.username;
    let i = 1;
    while (room.players.find(player => player.username === username)) {
        username = `${body.username}(${i})`;
        i++;
    }

    // Check if game has already started
    if (room.currentTurn !== 0) {
        room.spectators?.push({
            userId: body.userId,
            username: username,
            ws: ws
        });
        console.log(`${body.userId} joined room ${body.roomId} as spectator`);
    }
    else
    {
        // Add player to room
        room.players.push({
            userId: body.userId,
            username: username,
            ws: ws,
        });

        console.log(`${body.userId} joined room ${body.roomId}`);
    }

    // Send response
    sendRoomUpdate(body.roomId, room);
}

