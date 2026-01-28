<script lang="ts">
	import { CMessage, CChannel, CUser } from "$lib/domestique.ts/client";
    import { onDestroy } from "svelte";
    import MessageGroupEl from "./MessageGroup.svelte";
	let messages_container: HTMLDivElement;
	interface MessageGroup {
		author: string,
		messages: CMessage[],
		last: number
	}
	const groups: MessageGroup[] = []
	let last_group_el: MessageGroupEl;
	let last_group: MessageGroup;

	export async function add_group(group: MessageGroup) {
		groups.push(group);
		const first_message = group.messages[0];
		if (!first_message) throw 'no';
		await first_message.load()
		const el: MessageGroupEl = new MessageGroupEl({
			props: {
				author: first_message.author!,
				messages: group.messages
			},
			target: messages_container
		})
		onDestroy(() => el.$destroy());
		last_group_el = el;
	}
	export async function bulk_load(messages: CMessage[]) {
		let group: MessageGroup | undefined = undefined;
		for (const message of messages) {
			if (group &&
				(group.author != message._author ||
				+message.timestamp - group.last >= 5000)
			) {
				groups.push(group)
				group = undefined
				continue;
			} else if (group) {
				group.last = +message.timestamp
				group.messages.push(message)
			}
			if (!group) {
				group = {
					author: message._author,
					messages: [message],
					last: +message.timestamp
				}
				last_group = group;
				continue;
			}
		}
		if (group)
			groups.push(group)
	}
	async function add_message_to_last_group(message: CMessage) {
		console.log(last_group_el)
	}
	export async function add_message(message: CMessage) {
		await message.load();
		let group = last_group
		if (group.author != message._author ||
			+message.timestamp - group.last >= 5000) {
			group = {
				author: message._author,
				messages: [message],
				last: +message.timestamp
			}
			last_group = group;
			return await add_group(group)
		}
		last_group.last = +message.timestamp
		add_message_to_last_group(message)
	}
</script>

<div class="messages" bind:this={messages_container}></div>
