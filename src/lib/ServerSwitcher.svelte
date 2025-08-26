<script lang='ts'>
    import { makeClient } from "./client";

	const SERVERS: Record<string, [string, string]> = {
		'Rugia': [
			'wss://api.chat.eqilia.eu/api/v0/live/ws',
			'https://api.chat.eqilia.eu'
		],
		'berry\'s server': [
			'ws://domestique.goog-search.eu.org/api/v0/live/ws',
			'http://domestique.goog-search.eu.org'
		],
		'localhost': [
			'ws://localhost:40000/api/v0/live/ws',
			'http://localhost:40000'
		]
	}
	let serverSymbol = Symbol()
	function getCurrentServer() {
		const wsurl: string = localStorage.getItem('wsurl') ?? "wss://api.chat.eqilia.eu/api/v0/live/ws";
		const apiurl: string = localStorage.getItem('apiurl') ?? "https://api.chat.eqilia.eu";
		const [name] = Object.entries(SERVERS)
			.find(([_,[ws, api]]) => ws == wsurl && api == apiurl) ??
			['Custom'];
		return name;
	}
	let customWsUrl = localStorage.getItem('wsurl') ?? "wss://api.chat.eqilia.eu/api/v0/live/ws";
	let customApiUrl = localStorage.getItem('apiurl') ?? "https://api.chat.eqilia.eu";
</script>

Current server: {#key serverSymbol}{getCurrentServer()}{/key}
<br>
Servers:
<br>
<ul>
	{#each Object.keys(SERVERS) as serverName}
		{@const server = SERVERS[serverName]}
		<li>
			<button on:click={() => {
				localStorage.setItem('wsurl', server[0]);
				localStorage.setItem('apiurl', server[1]);
				serverSymbol = Symbol();
				makeClient()
			}}>
				{serverName} - {server[0]} {server[1]}
			</button>
		</li>
	{/each}
	<li>
		Custom
		<br>
		<input type="text" bind:value={customWsUrl} placeholder="Websocket URL">
		<input type="text" bind:value={customApiUrl} placeholder="API URL">
		<button on:click={() => {
			localStorage.setItem('wsurl', customWsUrl);
			localStorage.setItem('apiurl', customApiUrl);
			serverSymbol = Symbol();
			makeClient()
		}}>set URLs</button>
	</li>
</ul>
