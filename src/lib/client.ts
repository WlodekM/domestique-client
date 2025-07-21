import { CChannel, CGuild, Client, CMessage, CUser } from "./domestique.ts/client.ts";
import { page, showNavbar } from "./stores.ts";
import { goto } from '$app/navigation';

const client = new Client();

globalThis.CChannel = CChannel
globalThis.CGuild = CGuild
globalThis.CMessage = CMessage
globalThis.CUser = CUser

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

const realFetch = client.cache.requests.fetch;

const requestsList: string[] = []

client.cache.requests.fetch = function fetch(path:string, init: RequestInit): Promise<Response> {
    console.log(init.method??'GET', path, {trace:new Error()})
    requestsList.push(path)
    return realFetch(path, init)
}

window.requestsList = requestsList;

export default client;
