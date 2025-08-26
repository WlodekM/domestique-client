<script lang='ts'>
    import { makeClient } from "./client";

	const SERVERS: Record<string, [string, string]> = {
		'Rugia': [
			'wss://api.chat.eqilia.eu/api/v0/live/ws',
			'https://api.chat.eqilia.eu'
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
</ul>
