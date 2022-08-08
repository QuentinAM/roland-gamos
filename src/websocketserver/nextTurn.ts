import { sendRoomUpdate } from './sendRoomUpdate';
import { rooms } from './index';
import { Room } from './wstypes';

export function nextTurn(roomId: string, currentTurn: number, currentPlayerIndex: number, gameNumber: number) {
    const room = rooms.get(roomId);
    if (!room) {
        return;
    }

    // Check if room is empty, if so delete it
    if (room.players.length === 0) {
        rooms.delete(roomId);
        return;
    }

    // Check if turn is already over
    if (room.currentTurn != currentTurn || room.gameNumber != gameNumber || room.isGameOver) // TODO: fix this : it work but some calls are made while game is finished
        return;

    console.log(`Turn ${currentTurn} starting in room ${roomId}.`);

    // Check if there are still players in the room
    if (room.players.length === 0) {
        console.log(`Room ${roomId} is empty, deleting it.`);
        rooms.delete(roomId);
        return;
    }

    let guessIsInCorrect = !room.currentPlayerHasGuessed && room.players.length > 1;

    if (guessIsInCorrect) {
        // Guess is incorrect, eliminate player
        console.log(`Player ${room.players[currentPlayerIndex]?.userId} was eliminated in room ${roomId} at turn ${currentTurn}.`);
        room.players[currentPlayerIndex].turn = currentTurn;
        room.eliminatedPlayers.push(room.players.splice(currentPlayerIndex, 1)[0]);
    }
    clearTimeout(room.interval);

    if (room.players.length > 1) {
        // Go to the next turn
        room.currentPlayerIndex = guessIsInCorrect ? room.currentPlayerIndex % room.players.length : (room.currentPlayerIndex + 1) % room.players.length;
        room.currentTurnStartTime = Date.now();
        room.currentPlayerHasGuessed = false;
        room.currentPlayerHasAttemptedGuess = false;
        room.currentGuess = '';

        sendRoomUpdate(roomId, room);
    } else {
        // Game is over
        console.log(`Game is over in room ${roomId}.`);

        room.isGameOver = true;

        // Set turn for the winner
        room.players[0].turn = currentTurn;

        // Set winner in winsArray
        room.winsArray[room.players[0].userId] = room.winsArray[room.players[0].userId] ? room.winsArray[room.players[0].userId] + 1 : 1;

        // Reset players
        room.eliminatedPlayers.forEach(p => {
            room.players.push(p);
        });

        // Put spectator in players
        if (room.spectators) {
            room.players = [...room.players, ...room.spectators];
            room.spectators = [];
        }

        // Re calculate hostPlayerIndex
        room.hostPlayerIndex = room.players.findIndex(p => p.userId === room.hostPlayerId);

        // Reset turn
        room.currentTurn = 0;

        // Eliminated players will be reset only if restart to correctly display leaderboard on front

        sendRoomUpdate(roomId, room);
    }
}