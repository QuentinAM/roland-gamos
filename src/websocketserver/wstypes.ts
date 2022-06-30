import { WebSocket } from 'ws';

export interface Room {
    id: string;
    hostPlayerIndex: number;
    players: Player[];
    eliminatedPlayers: Player[];
    currentPlayerIndex: number;
    currentTurn: number;
    currentTurnStartTime: Date;
    currentPlayerHasGuessed: boolean;
    currentGuess: string;
    enteredArtists: Artist[];
}

export interface Player {
    userId: string;
    username: string;
    ws: WebSocket | undefined;
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
    };
}

export interface StartMessage extends Message {
    type: 'START';
    body: {
        userId: string;
    };
}

export interface GuessMessage extends Message {
    type: 'GUESS';
    body: {
        userId: string;
        guess: string;
    };
}

export interface GuessingMessage extends Message {
    type: 'GUESSING';
    body: {
        userId: string;
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