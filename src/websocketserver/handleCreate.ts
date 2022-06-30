import { WebSocket } from 'ws';
import { Room, Player, UpdateResponse, CreateMessage } from './wstypes';
import { rooms, wss } from './index';

export function handleCreate(ws: WebSocket, data: CreateMessage) {
    const body = data.body;

    // Generate a random room id
    const roomId: string = (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)).substring(0, 6);

    const player: Player = {
        userId: body.userId,
        username: body.username,
        ws: ws,
    };

    rooms.set(roomId, {
        id: roomId,
        players: [player],
        hostPlayerIndex: 0,
        eliminatedPlayers: [],
        enteredArtists: [],
        currentPlayerIndex: 0,
        currentTurn: 0,
        currentTurnStartTime: new Date(),
        currentPlayerHasGuessed: false,
        currentGuess: '',
    });

    console.log(`${body.username} created room ${roomId}`);

    const response: UpdateResponse = {
        type: 'UPDATE',
        body: {
            room: rooms.get(roomId) as Room,
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