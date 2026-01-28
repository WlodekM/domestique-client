<script lang="ts" >
	//TODO: put this in a Channel.svelte or something
	import client from "$lib/client";
	import { goto } from "$app/navigation";
	import { onMount, onDestroy } from "svelte";
    import requireLogin from "$lib/requireLogin";
	import { page } from "$app/stores";
	import { CMessage, CChannel, CUser } from "$lib/domestique.ts/client";
	import type { CGuild, User } from "$lib/domestique.ts/client";
    import MessageGroup from "$lib/MessageGroup.svelte";
	import { tick } from "svelte";

	function scrollToBottomOfElement(element: HTMLElement) {
		element.scrollTo(0, element.scrollHeight);
	}

	let id: string;
	$: id = $page.params.id;
	let guildId: string;
	$: guildId = $page.params.guild;
	let input: HTMLTextAreaElement;
	let sendButton: HTMLButtonElement;
	let renders = 0;
	let symbolThing: Symbol = Symbol();
	let messagesElem: HTMLDivElement;
	async function onMessage({message, channel}: {message: CMessage, channel: string}) {
		// console.log(channel, id);
		if (channel !== id)
			return;
		console.log("re-rendering");
		const parent: HTMLDivElement = messagesElem.parentElement as HTMLDivElement;
        let scrolledToBottom = //@ts-ignore: idk y but it no like scrollTopMax
			parent.scrollTopMax == parent.scrollTop;
		renders++;
		messages.push(message)
		const ghostMessage = ghostMessages.findIndex(m => m._author === message._author && m.content === message.content);
		if (ghostMessage !== -1)
			ghostMessages.splice(ghostMessage);
		symbolThing = Symbol();
		await tick()
        if(scrolledToBottom) scrollToBottomOfElement(parent);
	}

	onDestroy(() => {
		// console.log('removed lisserner')
		client.off('message', onMessage);
	});
	let messages: CMessage[] = []
	let ghostMessages: CMessage[] = []
	async function loadMessages(channel: CChannel) {
		await channel.load()
		messages.unshift(...channel.messages.toReversed());
		tick().then(()=>scrollToBottomOfElement(messagesElem.parentElement!));
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
	let ready: boolean = false;
	const readyPromise = requireLogin()
		.then(()=>ready = true);
	let guildFetched: (value: CGuild | PromiseLike<CGuild>) => void;
	const fetchingGuild = new Promise<CGuild>((resolve) => {guildFetched = resolve})
	onMount(async () => {
		if (!ready)
			await readyPromise;
		// console.log(client._guilds)
		if (!client.guilds.loaded(guildId)) {
			if (!client._guilds.includes(guildId)) {
				// console.log('guild not loaded')
				return goto("/guilds");
			}
			await client.guilds.get(guildId)
		}
		const guild: CGuild = await client.guilds.get(guildId);
		guildFetched(guild);
		if (!guild._channels.includes(id)) return goto("/guilds");
		console.log('added lissner')
		client.on("message", onMessage);
	});
</script>
<div class="channel-page">
	<!-- <button title="does buttony things" on:click={()=> {
		console.log(messages, ghostMessages)
	}}>the button button</button> -->
	{#await readyPromise}logging in...
	{:then}
		{#await fetchingGuild}
			loading guild...
		{:then guild}
			{#await guild.channels.get(id)}
				loading channel
			{:then channel}
				<div class="messages" bind:this={messagesElem}>
					{#await loadMessages(channel)}
						loading messages...
					{:then}
						{#key symbolThing}
							<!-- render {renders}<br /> -->
							{#each getGroups([...messages, ...ghostMessages]) as group}
								<MessageGroup author={group.author} messages={group.messages} />
							{/each}
						{/key}
					{/await}
				</div>
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
						on:click={async (e) => {
							const ghostMessage = 
								new CMessage(client.cache, {
									authorId: client.userId,
									channelId: id,
									content: input.value,
									guildId,
									messageId: '0',
									timestamp: Date.now()
								}, channel);
							ghostMessages.push(ghostMessage)
							await ghostMessage.load();
							channel.send(input.value)
								.catch((e: Error) => console.error('sending error', e));
							renders++
							console.log("re-rendering");
							symbolThing = Symbol();
							const parent: HTMLDivElement = messagesElem.parentElement as HTMLDivElement;
							console.log(parent.scrollHeight, parent.scrollTop, parent.offsetHeight)
							let scrolledToBottom = //@ts-ignore: idk y but it no like scrollTopMax
								parent.scrollHeight - parent.offsetHeight == parent.scrollTop;
							await tick();
        					if(scrolledToBottom) scrollToBottomOfElement(parent);
							input.value = "";
						}} bind:this={sendButton}>send</button
					>
				</div>
			{/await}
		{/await}
	{/await}
</div>
<style>
	.messaging-area {
		display: flex;
		align-items: stretch;
		gap: .5em;
		padding: .5em;
		padding-inline: calc(.5em - 8px);
		padding-bottom: calc(.5em - 8px);
		/* background: red; */
		position: sticky;
		bottom: 0;
	}
	.channel-page {
		max-height: 100%;
		overflow: auto;
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
