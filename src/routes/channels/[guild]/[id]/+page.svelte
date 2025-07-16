<script lang="ts">
	import client from "$lib/client";
	import { goto } from "$app/navigation";
	import { onMount, onDestroy } from "svelte";
    import requireLogin from "$lib/requireLogin";
    requireLogin()
	import { page } from "$app/stores";
	import { CMessage, CChannel, CUser } from "$lib/domestique.ts/client";
	import type { User } from "$lib/domestique.ts/client";
    import MessageGroup from "$lib/MessageGroup.svelte";

	let id: string;
	$: id = $page.params.id;
	let guildId: string;
	$: guildId = $page.params.guild;
	onMount(async () => {
		if (!client.guilds.loaded(guildId)) {
			console.log('guild not loaded')
			return goto("/guilds");
		}
		const guild = await client.guilds.get(guildId);
		if (!guild._channels.includes(id)) return goto("/guilds");
		console.log('added lissner')
		client.on("message", onMessage);
	});
	let input: HTMLTextAreaElement;
	let sendButton: HTMLButtonElement;
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
	interface MessageGroup {
		author: User,
		messages: CMessage[]
	}
	type MessageGroupArray = MessageGroup[];
	function getGroups(messages:CMessage[]): MessageGroupArray {
		return messages.reduce<MessageGroupArray>((prev: MessageGroupArray, curr) => {
			if ((!prev.at(-1) ||
				Number(curr.timestamp) -
				Number(prev.at(-1)?.messages?.at(-1)?.timestamp ?? -Infinity) < 60000 )&&
				prev.at(-1)?.author.username == curr.author?.username && !(
					curr.author?.username == 'fairlight' &&
					prev.at(-1) &&
					prev.at(-1)?.messages.at(-1)?.author?.username == 'fairlight' &&
					prev.at(-1)?.messages.at(-1)?.content.split(': ')[0] &&
					prev.at(-1)?.messages.at(-1)?.content.split(': ')[0] !==
					curr.content.split(': ')[0]
				)) {
				prev.at(-1)?.messages.push(curr)
				return prev
			}
			prev.push({
				author: curr.author as User,
				messages: [curr]
			})
			return prev;
		}, [])
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
				{#each getGroups(messages) as group}
					<MessageGroup author={group.author} messages={group.messages} />
				{/each}
			{/key}
		{/await}
		<div class="messaging-area">
			<textarea
				bind:this={input}
				on:keypress={(event) => {
					if (event.key != 'Enter')
						return;
					if (event.shiftKey)
						return;
					event.preventDefault()
					sendButton.click()
				}}
				placeholder="Message..."
				rows="1"
				></textarea>
			<button
				on:click={(e) => {
					channel.send(input.value);
					input.value = "";
				}} bind:this={sendButton}>send</button
			>
		</div>
	{/await}
{/await}
<style>
	.messaging-area {
		display: flex;
		align-items: stretch;
		gap: .5em;
		/* background: red; */
	}
	.messaging-area > textarea {
		flex-grow: 1;
    	padding: .35em;
		margin: 0;
	}
	.messaging-area > button {
		height: 100%;
	}
</style>
