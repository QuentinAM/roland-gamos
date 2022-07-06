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

    if (!room.currentPlayerHasGuessed && room.players.length > 1) {
        // Guess is incorrect, eliminate player
        console.log(`Player ${room.players[currentPlayerIndex]?.userId} was eliminated in room ${roomId} at turn ${currentTurn}.`);
        room.players[currentPlayerIndex].turn = currentTurn;
        room.eliminatedPlayers.push(room.players.splice(currentPlayerIndex, 1)[0]);
    }

    if (room.players.length > 1) {
        // Go to the next turn
        room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
        room.currentTurnStartTime = Date.now();
        room.currentPlayerHasGuessed = false;
        room.currentPlayerHasAttemptedGuess = false;
        room.currentGuess = '';

        sendRoomUpdate(roomId, room);
    } else {
        // Game is over
        console.log(`Game is over in room ${roomId}.`);

        room.isGameOver = true;
        
        const lastPlayer = room.players[0];

        // Reset eliminated players
         room.eliminatedPlayers.forEach(p => {
            if (p.userId === lastPlayer.userId)
                return;
            room.players.push(p);
        });

        // Eliminated players will be reset only if restart to correctly display leaderboard on front

        clearInterval(room.interval);
        sendRoomUpdate(roomId, room);
    }
}
