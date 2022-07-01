import { WebSocket } from 'ws';

export interface Room {
    id: string;
    hostPlayerIndex: number;
    hostPlayerId: string;
    players: Player[];
    eliminatedPlayers: Player[];
    currentPlayerIndex: number;
    currentTurn: number;
    currentTurnStartTime: number;
    currentPlayerHasAttemptedGuess: boolean;
    currentPlayerHasGuessed: boolean;
    currentGuess: string;
    tracks: Track[];
    enteredArtists: Artist[];
    interval?: NodeJS.Timeout;
}

export interface Player {
    userId: string;
    username: string;
    ws?: WebSocket;
    turn?: number;
}

export interface Track {
    name: string;
    trackImage: string;
    releaseDate: string;
    previewUrl: string;
    artist: Artist;
}

export interface Artist {
    name: string;
    imageUrl: string;
}

export type MessageType = 'CREATE' | 'JOIN' | 'LEAVE' | 'START' | 'GUESS' | 'GUESSING';

export interface Message {
    type: MessageType;
    body: any;
}

export interface CreateMessage extends Message {
    type: 'CREATE';
    body: {
        userId: string;
        username: string;
    };
}

export interface JoinMessage extends Message {
    type: 'JOIN';
    body: {
        userId: string;
        username: string;
        roomId: string;
    };
}

export interface LeaveMessage extends Message {
    type: 'LEAVE';
    body: {
        userId: string;
        roomId: string;
    };
}

export interface StartMessage extends Message {
    type: 'START';
    body: {
        playlistStart: string;
        userId: string;
        roomId: string;
    };
}

export interface GuessMessage extends Message {
    type: 'GUESS';
    body: {
        userId: string;
        roomId: string;
        guess: string;
    };
}

export interface GuessingMessage extends Message {
    type: 'GUESSING';
    body: {
        userId: string;
        roomId: string;
        currentGuess: string;
    };
}

export interface UpdateResponse {
    type: 'UPDATE';
    body: {
        room: Room;
    };
}

export interface ErrorResponse {
    type: 'ERROR';
    body: {
        message: string;
    };
}