<script lang="ts">
    import client from "$lib/client";
    import requireLogin from "$lib/requireLogin";
</script>
{#await requireLogin()}logging in...
{:then}
    {#if client.ws?.readyState == WebSocket.OPEN}
        logged in as {client.self?.username}
    {:else}
        disconnected
    {/if}
{/await}
