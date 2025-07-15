import { page } from "./stores.ts";
import { goto } from '$app/navigation';
import client from "./client.ts";

export default function requireLogin(): void {
    if (client.ws?.readyState != WebSocket.OPEN) {
        page.set('login');
        goto('/login');
    }
}
