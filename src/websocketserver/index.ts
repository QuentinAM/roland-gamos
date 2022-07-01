import { WebSocketServer } from 'ws';
import { handleGuess } from './handlers/handleGuess';
import { handleCreate } from './handlers/handleCreate';
import { handleGuessing } from './handlers/handleGuessing';
import { handleJoin } from './handlers/handleJoin';
import { handleLeave } from './handlers/handleLeave';
import { handleStart } from './handlers/handleStart';
import { createServer } from 'https';
import { readFileSync } from 'fs';
import { Message, LeaveMessage, StartMessage, GuessMessage, GuessingMessage, Room, CreateMessage, JoinMessage, UpdateResponse } from './wstypes';
import 'dotenv/config'
import 'isomorphic-fetch';

export const prod = process.execArgv[0] != '-r';
export const rooms = new Map<string, Room>();


export let wss: WebSocketServer;
if (prod) {
    console.log('Starting production server');

    const certDir = `/etc/letsencrypt/live`;
    const domain = `box.begue.cc`;
    const server = createServer({
        key: readFileSync(`${certDir}/${domain}/privkey.pem`),
        cert: readFileSync(`${certDir}/${domain}/fullchain.pem`)
    });
    wss = new WebSocketServer({ server });
    server.listen(8080);
}
else {
    console.log('Starting developement server');

    wss = new WebSocketServer({ port: 8080 });
}

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
                handleGuess(ws, data as GuessMessage);
                break;
            case 'GUESSING':
                handleGuessing(ws, data as GuessingMessage);
                break;
            case 'LEAVE':
                handleLeave(ws, data as LeaveMessage);
                break;
            default:
                break;
        }
    });
});
