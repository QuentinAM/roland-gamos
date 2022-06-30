import { WebSocket, WebSocketServer } from 'ws';
import { handleCreate } from './handleCreate';
import { handleJoin } from './handleJoin';
import { handleLeave } from './handleLeave';
import { sendRoomUpdate } from './sendRoomUpdate';
import { Message, LeaveMessage, StartMessage, GuessMessage, GuessingMessage, Room, CreateMessage, JoinMessage, ErrorResponse, UpdateResponse } from './wstypes';

export const rooms = new Map<string, Room>();

export const wss = new WebSocketServer({ port: 8080 });

// Log server startup
wss.on('listening', () => {
    console.log('Server started');
});

// Handle incoming messages
wss.on('connection', function connection(ws) {
    ws.on('message', function message(rawData) {
        const data = JSON.parse(rawData.toString()) as Message;

        switch (data.type) {
            case 'CREATE':
                handleCreate(ws, data as CreateMessage);
                break;
            case 'JOIN':
                handleJoin(ws, data as JoinMessage);
                break;
            case 'START':
                handleStart(ws, data as StartMessage);
                break;
            case 'GUESS':
                break;
            case 'GUESSING':
                break;
            case 'LEAVE':
                handleLeave(ws, data as LeaveMessage);
                break;
            default:
                break;
        }
    });
});

function handleStart(ws: WebSocket, data: StartMessage) {
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

    // Check if user is in the room and the host
    const room = rooms.get(body.roomId);
    if (!room?.players.find(player => player.userId === body.userId)
        || room?.players.findIndex(player => player.userId === body.userId) != room.hostPlayerIndex) {
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

    // Start game
    room.currentPlayerIndex = 0;
    room.currentTurn = 1;
    room.currentTurnStartTime = new Date().getTime();
    room.currentPlayerHasGuessed = false;

    // Send update to all players in the room
    sendRoomUpdate(body.roomId, room);
}

function handleGuess(ws: WebSocket, data: GuessMessage) {
}

function handleGuessing(ws: WebSocket, data: GuessingMessage) {
}

