import { Client } from "./domestique.ts/client.ts";
import { page } from "./stores.ts";
import { goto } from '$app/navigation';

const client = new Client();

client.ws?.addEventListener('close', _ => {
    console.error('connection closed')
    page.set('login')
    goto('login');
})

client.ws?.addEventListener('error', _ => {
    console.error('connection errored')
    page.set('login')
    goto('login');
})

const realEmit = client.emit;

client.emit = function (...args) {
    console.log(`EMIT`, ...args);
    realEmit.call(client, ...args)
}

window.client = client;

export default client;
