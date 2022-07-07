import { sendRoomUpdate } from './sendRoomUpdate';
import { rooms } from './index';

export function nextTurn(roomId: string, currentTurn: number, currentPlayerIndex: number) {
    const room = rooms.get(roomId);
    if (!room) {
        return;
    }

    // Check if turn is already over
    if (room.currentTurn != currentTurn || room.isGameOver) // TODO: fix this : it work but some calls are made while game is finish
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

        // Reset players
        room.eliminatedPlayers.forEach(p => {
            room.players.push(p);
        });

        // Re calculate hostPlayerIndex
        room.hostPlayerIndex = room.players.findIndex(p => p.userId === room.hostPlayerId);

        // Eliminated players will be reset only if restart to correctly display leaderboard on front

        clearInterval(room.interval);
        sendRoomUpdate(roomId, room);
    }
}
