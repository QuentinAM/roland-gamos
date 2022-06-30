import { WebSocket, WebSocketServer } from 'ws';
import { Message, LeaveMessage, StartMessage, GuessMessage, GuessingMessage, Room, Player, UpdateResponse, CreateMessage, JoinMessage } from './wstypes';

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
                handleCreate(ws, data as CreateMessage);
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

function handleCreate(ws: WebSocket, data: CreateMessage) {
    const body = data.body;

    // Generate a random room id
    const roomId: string =
        (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)).substring(0, 6);

    const player: Player = {
        cookieId: body.cookieId,
        username: body.username,
        ws: ws,
    }

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
    }

    response.body.room.players.forEach((player: Player) => {
        delete player.ws;
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(response));
        }
    })
}

function handleJoin(ws: WebSocket, data: JoinMessage) {
}

function handleLeave(ws: WebSocket, data: LeaveMessage) {
}

function handleStart(ws: WebSocket, data: StartMessage) {
}

function handleGuess(ws: WebSocket, data: GuessMessage) {
}

function handleGuessing(ws: WebSocket, data: GuessingMessage) {
}

