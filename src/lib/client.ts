import { Client } from "./domestique.ts/client.ts";
import { page, showNavbar } from "./stores.ts";
import { goto } from '$app/navigation';

const client = new Client();

export function setupWs() {
    client.ws?.addEventListener('close', _ => {
        console.error('connection closed')
        page.set('login')
        goto('login');
        showNavbar.set(false)
    })

    client.ws?.addEventListener('error', _ => {
        console.error('connection errored')
        page.set('login')
        goto('login');
        showNavbar.set(false)
    })
}

const realEmit = client.emit;

client.emit = function (...args) {
    console.log(`EMIT`, ...args);
    realEmit.call(client, ...args)
}

window.client = client;

export default client;
