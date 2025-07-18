<script lang="ts">
    import client from "./client";
	import type { CMessage, CUser, User } from "./domestique.ts/client";
	import { md } from "./markdown";
    import { mentionUserCache } from "./stores";
	export let author: User;
	export let message: CMessage;

	const isBridge: boolean = author.username == 'fairlight';
	let _mentionUserCache: Record<string, User|null>;
	mentionUserCache.subscribe((value) => _mentionUserCache = value);
	async function getContent(content: string) {
		if (isBridge)
			content = content.replace(/^.+: /g,'');
		const mentionMatches = content
			.matchAll(/<@([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})>/gs);
		// const mentionUserCache: Record<string, User> = {};
		for (const match of mentionMatches) {
			if (_mentionUserCache[match[1]] !== undefined)
				continue;
			let user: User;
			try {
				user = await client.cache.getUser(match[1]);
			} catch (error) {
				console.error('error loading mention user', error)
				mentionUserCache.set({
					..._mentionUserCache,
					...Object.fromEntries([[match[1], null]])
				})
				continue;
			}
			mentionUserCache.set({
				..._mentionUserCache,
				...Object.fromEntries([[match[1], user]])
			})
		}
		const tokens = md.parse(content, {});
		md.linkify.add("<@", {
			validate: function (text: string, pos: number) {
				var tail = text.slice(pos);
				//12345678-1234-1234-1234-123456789ABC
				var match = tail.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})>/gs);
				return match ? match[0].length : 0;
			},
			normalize: function (match) {
				const id = match.raw.replace(/^<@/,'').replace(/>$/,'')
				match.url = "/users/" + id;
				match.text = _mentionUserCache[id] ? '@'+_mentionUserCache[id].username : '@invalid-user'
			},
		});
		for (const token of tokens) {
			if (token.children) {
				for (const childToken of token.children) {
					if (!childToken.attrs)
						continue;
					if (childToken.type === "image") {
						const srcPos = childToken.attrs.findIndex(
							(attr: string[]) => attr[0] === "src"
						);
						childToken.attrs[srcPos][1] = "about:blank";
						// if (
						//     !IMAGE_HOST_WHITELIST.some(o => {
						//             try {
						//                 const url = new URL(childToken.attrs[srcPos][1])
						//                 return url.host == o
						//             } catch (error) {
										
						//             }
						//         }
						//     )
						// ) {
						//     console.log(childToken, IMAGE_HOST_WHITELIST, childToken.attrs[srcPos][1]);
						//     childToken.attrs[srcPos][1] = "about:blank";
						// }
					}
					//TODO: link confirmation
					// if (childToken.type === "link_open") {
					// 	const uh = childToken.attrs.find(
					// 		(attr: string[]) => attr[0] === "href"
					// 	);
					// 	if (!uh)
					// 		continue;
					// 	const href = uh[1];
					// 	const b64href = btoa(href);
					// 	childToken.attrs.push([
					// 		"onclick",
					// 		`return confirmLink('${b64href}')`,
					// 	]);
					// }
				}
			}
		}
		return md.renderer.render(tokens, md.options, {});
	}
</script>
<div class="message">
	<div class="message-content">
		{#await getContent(message.content)}{:then content} 
			{@html content}
		{/await}
	</div>
	<span class="timestamp">
		{message.timestamp.getHours().toString().padStart(2,'0')}:{message.timestamp.getMinutes().toString().padStart(2,'0')}
	</span>
</div>
<style>
	.message {
		display: flex;
		justify-content: space-between;
	}
	.message-content :global(p) {
		margin: 0;
	}
	.message-content :global(p:has(+p)) {
		margin-bottom: 1em;
	}
</style>
