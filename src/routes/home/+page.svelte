<script lang="ts">
    import client from "$lib/client";
    import { page } from "$lib/stores";
    import { goto } from '$app/navigation';
    if (client.ws?.readyState != WebSocket.OPEN) {
        $page = 'login';
        goto('/login');
    }
</script>
{#if client.ws?.readyState == WebSocket.OPEN}
    logged in as {client.self?.username}
{:else}
    disconnected
{/if}
