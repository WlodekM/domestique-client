<script lang="ts">
	import client from "$lib/client";
	import GuildButton from "$lib/GuildButton.svelte";
	import requireLogin from "$lib/requireLogin";
	let openedServer: string = '';
</script>
{#await requireLogin()}logging in...
{:then}
	guilds:
	{#each client._guilds as guildId}
		<GuildButton guildId={guildId} />
	{/each}
{/await}
