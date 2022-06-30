import { WebSocket, WebSocketServer } from 'ws';
import { handleCreate } from './handleCreate';
import { handleJoin } from './handleJoin';
import { handleLeave } from './handleLeave';
import { Message, LeaveMessage, StartMessage, GuessMessage, GuessingMessage, Room, CreateMessage, JoinMessage } from './wstypes';

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
}

function handleGuess(ws: WebSocket, data: GuessMessage) {
}

function handleGuessing(ws: WebSocket, data: GuessingMessage) {
}

