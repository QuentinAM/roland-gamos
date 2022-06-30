import { WebSocket, WebSocketServer } from 'ws';
import { Message, LeaveMessage, StartMessage, GuessMessage, GuessingMessage, Room, Player, UpdateResponse, CreateMessage, JoinMessage, ErrorResponse } from './wstypes';

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
                handleJoin(ws, data as JoinMessage);
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
        userId: body.userId,
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

    // Remove ws before sending response
    response.body.room.players.forEach((player: Player) => {
        delete player.ws;
    });

    // Send response
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(response));
        }
    })
}

function handleJoin(ws: WebSocket, data: JoinMessage) {
    const body = data.body;

    // Check if room exists
    if (!rooms.has(body.roomId)) {
        console.log(`Room ${body.roomId} does not exist.`);

        const response: ErrorResponse = {
            type: 'ERROR',
            body: {
                message: `Room ${body.roomId} does not exist.`,
            }
        }

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
        }

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
    }

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

function handleLeave(ws: WebSocket, data: LeaveMessage) {
}

function handleStart(ws: WebSocket, data: StartMessage) {
}

function handleGuess(ws: WebSocket, data: GuessMessage) {
}

function handleGuessing(ws: WebSocket, data: GuessingMessage) {
}

