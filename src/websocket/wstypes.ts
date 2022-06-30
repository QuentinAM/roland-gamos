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
    cookieId: string;
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
        cookieId: string;
        username: string;
    };
}

export interface JoinMessage extends Message {
    type: 'JOIN';
    body: {
        cookieId: string;
        username: string;
        roomId: string;
    };
}

export interface LeaveMessage extends Message {
    type: 'LEAVE';
    body: {
        cookieId: string;
    };
}

export interface StartMessage extends Message {
    type: 'START';
    body: {
        cookieId: string;
    };
}

export interface GuessMessage extends Message {
    type: 'GUESS';
    body: {
        cookieId: string;
        guess: string;
    };
}

export interface GuessingMessage extends Message {
    type: 'GUESSING';
    body: {
        cookieId: string;
        currentGuess: string;
    };
}

export interface UpdateResponse {
    type: 'UPDATE';
    body: {
        room: Room;
    };
}