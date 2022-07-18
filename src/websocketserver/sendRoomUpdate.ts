import { Room, UpdateResponse } from './wstypes';

export function sendRoomUpdate(roomId: string, room: Room) {
    let resRoom = { ...room };
    resRoom.interval = undefined;
    resRoom.players = resRoom.players?.map(player => {
        return { userId: player.userId, username: player.username, turn: player.turn };
    });
    resRoom.eliminatedPlayers = resRoom.eliminatedPlayers?.map(player => {
        return { userId: player.userId, username: player.username, turn: player.turn };
    });

    const response: UpdateResponse = {
        type: 'UPDATE',
        body: {
            room: resRoom,
        }
    };

    room.players.forEach(player => {
        if (!player.ws)
            console.log(`Player ${player.username} with cid ${player.userId} has no ws.`);

        player.ws?.send(JSON.stringify(response));
    });
    room.eliminatedPlayers.forEach(player => {
        if (!player.ws)
            console.log(`Eliminated Player ${player.username} with cid ${player.userId} has no ws.`);

        player.ws?.send(JSON.stringify(response));
    });
}
