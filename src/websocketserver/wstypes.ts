import { WebSocket } from 'ws';

export type ModeType = 'NORMAL' | 'TV';
export interface Playlist {
    url: string;
    name: string;
} 

export interface Room {
    id: string;
    hostPlayerIndex: number;
    hostPlayerId: string;
    players: Player[];
    spectators?: Player[];
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
    isGameOver: boolean;
    
    // Restart
    winsArray: {
        [key: string]: number; // [userId]: wins
    }
    gameNumber: number;

    // Setting
    mode: ModeType;
    timeBetweenRound: number;
    playlistStart: Playlist;
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

export type MessageType = 'CREATE' | 'JOIN' | 'LEAVE' | 'START' | 'GUESS' | 'GUESSING' | 'RESTART' | 'SETTING' | 'AUTOCOMPLETE';

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
        userId: string;
        roomId: string;
        timeBetweenRound: number;
    };
}

export interface RestartMessage extends Message {
    type: 'RESTART';
    body: {
        userId: string;
        roomId: string;
        timeBetweenRound: number;
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

export interface SettingMessage extends Message {
    type: 'SETTING';
    body: {
        userId: string;
        roomId: string;
        mode: ModeType;
        timeBetweenRound: number;
        playlistStart: Playlist;
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

export interface AutocompleteResponse {
    type: 'AUTOCOMPLETE';
    body: {
        artists: Artist[];
    }
}