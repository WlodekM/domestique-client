<script lang="ts">
    import client, { setupWs } from "$lib/client";
    import { showNavbar, page } from "$lib/stores";
    import { goto } from '$app/navigation';
    import { onMount } from "svelte";
    let username: string = '',
        password: string = '';
    let statusText: HTMLSpanElement;
    async function login(e: Event) {
        e.preventDefault();
        statusText.innerText = '';
        let success: boolean = true;
        try {
            await client.login(username, password)
        } catch (error) {
            statusText.innerText = `${(error as Error | string).toString()}`
            success = false;
        } finally {
            if (!success)
                return;
            console.log('succees?')
            setupWs()
            if (client.token !== null)
                localStorage.setItem('token', client.token)
            client.on('ready', () => {
                $showNavbar = true;
                $page = 'home';
                goto('/home');
            })
        }
    }
    async function tryLoginToken() {
        if (localStorage.getItem('token')) {
            statusText.innerText = 'Logging in using token';
            let success: boolean = true;
            try {
                await client.loginToken(localStorage.getItem('token') as string)
            } catch (error) {
                statusText.innerText = `Couldn't log in using token. ${(error as Error | string).toString()}`
                success = false;
            } finally {
                if (!success)
                    return;
                console.log('succees?')
                setupWs()
                client.on('ready', () => {
                    $showNavbar = true;
                    $page = 'home';
                    goto('/home');
                })
            }    
        }
    }
    onMount(tryLoginToken)
</script>

<center>
<form>
    <input
        type="text"
        name="username"
        id="username"
        bind:value={username}
        placeholder="username...."
        >
    <br>
    <input
        type="password"
        name="password"
        id="password"
        bind:value={password}
        placeholder="password..."
        >
    <br>
    <button on:click={login}>log in</button>
    <br>
    <span bind:this={statusText}></span>
</form>
</center>
