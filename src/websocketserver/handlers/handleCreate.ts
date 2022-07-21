import { WebSocket } from 'ws';
import { Room, Player, UpdateResponse, CreateMessage } from '../wstypes';
import { rooms, wss } from '../index';
import { sendRoomUpdate } from '../sendRoomUpdate';

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
        hostPlayerId: player.userId,
        hostPlayerIndex: 0,
        eliminatedPlayers: [],
        enteredArtists: [],
        currentPlayerIndex: 0,
        currentTurn: 0,
        currentTurnStartTime: 0,
        currentPlayerHasGuessed: false,
        currentPlayerHasAttemptedGuess: false,
        currentGuess: '',
        tracks: [],
        mode: 'NORMAL',
        timeBetweenRound: 30,
        playlistStart: {
            url: "https://open.spotify.com/playlist/3vZYzaSfr9HvjaIivjHyAC",
            name: 'RAP FR'            
        },
        isGameOver: false,
        spectators: [],
        winsArray: {},
        gameNumber: 1
    });

    console.log(`${body.userId} created room ${roomId}`);

    // Send response
    const room = rooms.get(roomId);
    sendRoomUpdate(roomId, room as Room);
}
