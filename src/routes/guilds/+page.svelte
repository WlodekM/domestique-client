<script lang="ts">
    import client from "$lib/client";
    import { page } from "$lib/stores";
    import { goto } from '$app/navigation';
    import GuildButton from "$lib/GuildButton.svelte";
    if (client.ws?.readyState != WebSocket.OPEN) {
        $page = 'login';
        goto('/login');
    }
    let openedServer: string = '';
</script>

guilds:
{#each client._guilds as guildId}
    <GuildButton guildId={guildId} />
{/each}
