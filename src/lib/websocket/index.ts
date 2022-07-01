import { browser, dev } from "$app/env";
import type { Message, Room, UpdateResponse } from "../../websocketserver/wstypes";
import { writable } from "svelte/store";
import { room } from "../game/data"

const url = dev ? "ws://localhost:8080" : "wss://box.begue.cc:8080";
let ws = new WebSocket(url);
export const websocket = writable<WebSocket | null>(null);

let onopen = () => {
    console.log("Connected to server");
    websocket.set(ws);
};

let onclose = () => {
    console.log("Disconnected from server");
    websocket.set(null);
    ws = new WebSocket(url);
    ws.onopen = onopen;
    ws.onclose = onclose;
    ws.onmessage = onmessage;
}

let onmessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data.toString()) as UpdateResponse;

    switch (data.type) {
        case "UPDATE":
            handleUpdate(data.body.room);
            break;
        default:
            console.log(`Unknown message type: ${data.type}`, data);
            break;
    }
}

ws.onopen = onopen;
ws.onclose = onclose;
ws.onmessage = onmessage;

function handleUpdate(updatedRoom: Room) {
    console.log(`Room ${updatedRoom.id} updated`);

    room.update((currentRoom) => {
        return updatedRoom;
    });
}