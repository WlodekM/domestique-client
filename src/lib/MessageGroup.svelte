<script lang="ts">
    import { goto } from "$app/navigation";
    import client from "./client";
    import type { CMessage, User } from "./domestique.ts/client";
    export let author: User;
    export let messages: CMessage[];
</script>

<div class="message-group">
    <div class="header">{author.username}</div>
    {#each messages as message}
        <div class="message">
            {message.content}
            <span class="timestamp">
                {message.timestamp.getHours().toString().padStart(2,'0')}:{message.timestamp.getMinutes().toString().padStart(2,'0')}
            </span>
        </div>
    {/each}
</div>

<style>
    .header {
        font-size: 1.2em;
        font-weight: bold;
    }
    .message {
        display: flex;
        justify-content: space-between;
    }
</style>
