//@ts-nocheck: this shit's fucked, man
/**
 * @file a wrapper for domestique.ts that adds a few things and some debug logging
 */
import { CChannel, CGuild, Client, CMessage, CUser } from "./domestique.ts/client.ts";
import { page, showNavbar } from "./stores.ts";
import { goto } from '$app/navigation';

let client: Client;

export function makeClient() {
    const wsurl: string = localStorage.getItem('wsurl') ?? "wss://api.chat.eqilia.eu/api/v0/live/ws";
    const apiurl: string = localStorage.getItem('apiurl') ?? "https://api.chat.eqilia.eu";
    if (!client)
        return client = new Client(wsurl, apiurl);
    const wasConnected = typeof client.ws !== 'undefined'
    if (client.ws)
        client.ws.close();
    client.wsUrl = wsurl;
    client.apiUrl = apiurl;
    client.cache.apiUrl = apiurl;
    if (wasConnected)
        client.connect();
}

makeClient()

globalThis.CChannel = CChannel
globalThis.CGuild = CGuild
globalThis.CMessage = CMessage
globalThis.CUser = CUser

export function setupWs() {
    client.ws?.addEventListener('close', _ => {
        console.error('connection closed')
        page.set('login')
        goto('/login');
        showNavbar.set(false)
    })

    client.ws?.addEventListener('error', _ => {
        console.error('connection errored')
        page.set('login')
        goto('/login');
        showNavbar.set(false)
    })
}

const realEmit = client.emit;

client.emit = function (...args) {
    console.log(`EMIT`, ...args);
    realEmit.call(client, ...args)
}

globalThis.client = client;

const realFetch = client.cache.requests.fetch;

const requestsList: string[] = []

const isFirefox = typeof InstallTrigger !== 'undefined';
client.cache.requests.fetch = function fetch(path:string, init: RequestInit): Promise<Response> {
    const traceError = new Error();
    let trace = '';
    // sorry, i aint getting a chromium browser just to make logs for that
    if (isFirefox)
        trace = traceError.stack!.split('\n')
            .slice(1,10)
            .map(l => {
                const split = l.split('@');
                let functionName = split.shift();
                if (!functionName)
                    return split.join('@');
                if (functionName.includes('/<'))
                    functionName = functionName.replace('/<', '<anonymous>')
                return `${functionName}() @ ${split.join('@')}`;
            })
            .join('\n');
    else trace = traceError;
    const methodColors = {
        GET: 'lightgreen',
        POST: '#39f',
        OPTIONS: '#aaa'
    }, STATUS_PREFIX_COLORS = {
        1: 'lightblue',
        2: 'lightgreen',
        3: 'aqua',
        4: 'red',
        5: 'darkred'
    }
    const returnValue = realFetch(path, init);
    const shortPath = path.startsWith(client.apiUrl) ? path.replace(client.apiUrl, '') : path;
    returnValue.then(r => {
        console.groupCollapsed(`%c${init.method??'GET'}%c ${r.status.toString()}%c${shortPath}`,
            `color: ${methodColors[init.method??'GET']}`, `color: ${STATUS_PREFIX_COLORS[r.status.toString()[0]]}`)
        if (typeof trace == 'string') {
            console.log(`%c${trace}`, 'color: lightblue')
        } else {
            console.log(trace)
        }
        console.log(path)
        console.groupEnd()
    })
    requestsList.push(path)
    return returnValue
}

globalThis.requestsList = requestsList;

export default client;
