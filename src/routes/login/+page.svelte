<script lang="ts">
	import client, { setupWs } from "$lib/client";
	import { showNavbar, page } from "$lib/stores";
	import { goto } from '$app/navigation';
	import { onMount } from "svelte";
    import ServerSwitcher from "$lib/ServerSwitcher.svelte";
	let username: string = '',
		password: string = '';
	let statusText: HTMLSpanElement;
	async function login(e: Event) {
		e.preventDefault();
		statusText.innerText = '';
		if (registering) {
			let success: boolean = true;
			try {
				await client.register(username, password)
			} catch (error) {
				success = false;
				statusText.innerText = `couldn't register. ${error}`;
				console.error(error);
				return;
			}
			if (!success)
				return;
		}
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
				statusText.innerText = `Couldn't log in using token. ${String(error as Error | string)}`
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
	let registering: boolean = false;
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
		<button on:click={login}>{#if registering}
				register
			{:else}
				log in
			{/if}</button>
		<br>
		<span bind:this={statusText}></span>
		<br>
		or <a href="#register" on:click={()=>registering=!registering}>{#if registering}
				log in
			{:else}
				register
			{/if}</a>
	</form>
	<details>
		<summary>Server switcher</summary>
		<ServerSwitcher />
	</details>
	<br>
	domestique svelte. made by berry with blood sweat and (a lack of) tears
</center>
