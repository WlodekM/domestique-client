import { page, showNavbar } from "./stores.ts";
import { goto } from '$app/navigation';
import client, { setupWs } from "./client.ts";

function tryLoginToken(): Promise<void> {
    if (localStorage.getItem('token')) {
        console.log('Logging in using token')
        let success: boolean = true;
        return new Promise((resolve, reject) => {
            client.loginToken(localStorage.getItem('token') as string)
                .catch((error) => {
                    console.error(`Couldn't log in using token. ${(error as Error | string).toString()}`);
                    page.set('login');
                    goto('/login');
                    success = false;
                })
                .then(() => {
                    if (!success)
                        return reject();
                    console.log('succees?')
                    setupWs()
                    client.on('ready', () => {
                        showNavbar.set(true);
                        console.info('resolve()', client._guilds)
                        resolve()
                    })
                })
        })
    }
    return new Promise((resolve) => resolve())
}
export default function requireLogin(): Promise<void> {
    return new Promise((resolve) => {
        if (client.ws?.readyState == WebSocket.OPEN)
            return resolve()
        if (localStorage.getItem('token')) {
            tryLoginToken().then(() => {
                resolve()
            }).catch((e) => {
                console.error('error while token login', e)
                page.set('login');
                goto('/login');
                resolve()
            })
        } else {
            page.set('login');
            goto('/login');
            resolve();
        }
    })
}
