import { WebSocket, WebSocketServer } from 'ws';
import { Message, CreateJoinMessage, LeaveMessage, StartMessage, GuessMessage, GuessingMessage, Room, Player, UpdateResponse } from './types';

const rooms = new Map<string, Room>();

const wss = new WebSocketServer({ port: 8080 });

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
                handleCreate(ws, data as CreateJoinMessage);
                break;
            case 'JOIN':
                break;
            case 'START':
                break;
            case 'GUESS':
                break;
            case 'GUESSING':
                break;
            case 'LEAVE':
                break;
            default:
                break;
        }
    });
});

function handleCreate(ws: WebSocket, data: CreateJoinMessage) {
    const body = data.body;

    const player: Player = {
        cookieId: body.cookieId,
        username: body.username,
        ws: ws,
    }

    rooms.set(body.roomId, {
        id: body.roomId,
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

    console.log(`${body.username} created room ${body.roomId}`);

    const response: UpdateResponse = {
        type: 'UPDATE',
        body: {
            room: rooms.get(body.roomId) as Room,
        }
    }

    response.body.room.players.forEach(player => {
        delete player.ws;
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(response));
        }
    })
}

function handleJoin(ws: WebSocket, data: CreateJoinMessage) {
}

function handleLeave(ws: WebSocket, data: LeaveMessage) {
}

function handleStart(ws: WebSocket, data: StartMessage) {
}

function handleGuess(ws: WebSocket, data: GuessMessage) {
}

function handleGuessing(ws: WebSocket, data: GuessingMessage) {
}

