import { dev } from "$app/env";
import type { ErrorResponse, Message, Room, UpdateResponse } from '../../websocketserver/wstypes';
import { room, autoComplete } from '../game/data';

const url =  dev ? 'ws://localhost:8080' : 'wss://rolandgamoswss.quentinam.fr';
export let ws = new WebSocket(url);

let onopen = () => {
	console.log('WS: Connected to server');
};

let onclose = () => {
	console.log('WS: Disconnected from server');
	ws = new WebSocket(url);
	ws.onopen = onopen;
	ws.onclose = onclose;
	ws.onmessage = onmessage;
};

let onmessage = (event: MessageEvent) => {
	const data = JSON.parse(event.data.toString()) as UpdateResponse | ErrorResponse | any;

	// console.log('WS: Received message', data);

	switch (data.type) {
		case 'UPDATE':
			handleUpdate(data.body.room);
			break;
		case 'ERROR':
			console.error(data.body.message);
			break;
		case 'AUTOCOMPLETE':
			handleAutoComplete(data.body.artists);
			break;
		default:
			console.log(`Unknown message type: ${data.type}`, data);
			break;
	}
};

ws.onopen = onopen;
ws.onclose = onclose;
ws.onmessage = onmessage;

function handleAutoComplete(artists: any[3]) {
	autoComplete.set(artists);
}

function handleUpdate(updatedRoom: Room) {
	room.set(updatedRoom);
}

export type SendMessage = (message: Message) => void;
export function sm(message: Message) {
	// console.log('WS: Sending message', message);
	ws.send(JSON.stringify(message));
}
