<script lang="ts">
	import client from "$lib/client";
	import { page as spage } from "$lib/stores";
	import { goto } from "$app/navigation";
	import { onMount, onDestroy } from "svelte";
	if (client.ws?.readyState != WebSocket.OPEN) {
		$spage = "login";
		goto("/login");
	}
	import { page } from "$app/stores";
	import type { CMessage, CChannel } from "$lib/domestique.ts/client";

	let id: string;
	$: id = $page.params.id;
	let guildId: string;
	$: guildId = $page.params.guild;
	onMount(async () => {
		if (!client.guilds.loaded(guildId)) return goto("/guilds");
		const guild = await client.guilds.get(guildId);
		if (!guild._channels.includes(id)) return goto("/guilds");
		console.log('added lissner')
		client.on("message", onMessage);
	});
	let input: HTMLInputElement;
	let renders = 0;
	let symbolThing: Symbol = Symbol();
	function onMessage({message, channel}: {message: CMessage, channel: string}) {
		console.log(channel, id);
		if (channel !== id)
			return;
		console.log("re-rendering");
		symbolThing = Symbol();
		renders++;
		messages.push(message)
	}

	onDestroy(() => {
		console.log('removed lisserner')
		client.off('message', onMessage);
	});
	let messages: CMessage[] = []
	async function loadMessages(channel: CChannel) {
		await channel.load()
		messages.unshift(...channel.messages.toReversed());
	}
</script>

{#await client.guilds.get(guildId)}
	loading guild...
{:then guild}
	{#await guild.channels.get(id)}
		loading channel
	{:then channel}
		{#await loadMessages(channel)}
			loading messages...
		{:then}
			{#key symbolThing}
				render {renders}<br />
				{#each messages as message}
					<div>
						{message.author?.displayName}: {message.content}
					</div>
				{/each}
			{/key}
		{/await}
		<input type="text" bind:this={input} />
		<button
			on:click={(e) => {
				channel.send(input.value);
				input.value = "";
			}}>send</button
		>
	{/await}
{/await}
