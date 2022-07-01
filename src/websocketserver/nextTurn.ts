import { sendRoomUpdate } from './sendRoomUpdate';
import { rooms } from './index';

export function nextTurn(roomId: string, currentTurn: number, currentPlayerIndex: number) {
    const room = rooms.get(roomId);
    if (!room) {
        return;
    }

    // Check if turn is already over
    if (room.currentTurn != currentTurn)
        return;

    console.log(`Turn ${currentTurn} in room ${roomId} is over.`);

    if (!room.currentPlayerHasGuessed) {
        // Guess is incorrect, eliminate player
        room.eliminatedPlayers.push(room.players.splice(currentPlayerIndex, 1)[0]);
    }

    if (room.players.length > 1) {
        // Go to the next turn
        room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
        room.currentTurn = room.currentTurn + 1;
        room.currentTurnStartTime = Date.now();
        room.currentPlayerHasGuessed = false;
        room.currentPlayerHasAttemptedGuess = false;
        room.currentGuess = '';

        sendRoomUpdate(roomId, room);
    } else {
        // Game is over
        // TODO: Game finished logic
        clearInterval(room.interval);
    }
}
