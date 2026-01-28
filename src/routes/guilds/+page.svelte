<script lang="ts">
	import client from "$lib/client";
	import GuildButton from "$lib/GuildButton.svelte";
	let openedServer: string = '';
</script>
guilds:
{#each client._guilds as guildId}
	<GuildButton guildId={guildId} />
{/each}
