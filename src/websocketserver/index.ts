import { WebSocketServer } from 'ws';
import { handleGuess } from './handlers/handleGuess';
import { handleCreate } from './handlers/handleCreate';
import { handleGuessing } from './handlers/handleGuessing';
import { handleJoin } from './handlers/handleJoin';
import { handleLeave } from './handlers/handleLeave';
import { handleStart } from './handlers/handleStart';
import { handleRestart } from './handlers/handleRestart';
import { createServer } from 'https';
import { readFileSync } from 'fs';
import { Message, LeaveMessage, StartMessage, GuessMessage, GuessingMessage, Room, CreateMessage, JoinMessage, UpdateResponse, RestartMessage, SettingMessage } from './wstypes';

import 'dotenv/config'
import 'isomorphic-fetch';

// export const prod = process.execArgv[0] == '-r';
export const rooms = new Map<string, Room>();

export let wss: WebSocketServer;
console.log('Starting server');
wss = new WebSocketServer({ port: 8080 });

import { guess } from './music/guess';
import { handleSetting } from './handlers/handleSetting';
// Log server startup
wss.on('listening', async () => {
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
            case 'RESTART':
                handleRestart(ws, data as RestartMessage);
            case 'SETTING':
                handleSetting(ws, data as SettingMessage);
            default:
                break;
        }
    });
});
