"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wss = exports.rooms = void 0;
const ws_1 = require("ws");
const handleGuess_1 = require("./handlers/handleGuess");
const handleCreate_1 = require("./handlers/handleCreate");
const handleGuessing_1 = require("./handlers/handleGuessing");
const handleJoin_1 = require("./handlers/handleJoin");
const handleLeave_1 = require("./handlers/handleLeave");
const handleStart_1 = require("./handlers/handleStart");
const handleRestart_1 = require("./handlers/handleRestart");
require("dotenv/config");
require("isomorphic-fetch");
// export const prod = process.execArgv[0] == '-r';
exports.rooms = new Map();
console.log('Starting server');
exports.wss = new ws_1.WebSocketServer({ port: 8080 });
const handleSetting_1 = require("./handlers/handleSetting");
// Log server startup
exports.wss.on('listening', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Server started');
}));
// Handle incoming messages
exports.wss.on('connection', function connection(ws) {
    ws.on('message', function message(rawData) {
        const data = JSON.parse(rawData.toString());
        switch (data.type) {
            case 'CREATE':
                (0, handleCreate_1.handleCreate)(ws, data);
                break;
            case 'JOIN':
                (0, handleJoin_1.handleJoin)(ws, data);
                break;
            case 'START':
                (0, handleStart_1.handleStart)(ws, data);
                break;
            case 'GUESS':
                (0, handleGuess_1.handleGuess)(ws, data);
                break;
            case 'GUESSING':
                (0, handleGuessing_1.handleGuessing)(ws, data);
                break;
            case 'LEAVE':
                (0, handleLeave_1.handleLeave)(ws, data);
                break;
            case 'RESTART':
                (0, handleRestart_1.handleRestart)(ws, data);
            case 'SETTING':
                (0, handleSetting_1.handleSetting)(ws, data);
            default:
                break;
        }
    });
});
//# sourceMappingURL=index.js.map