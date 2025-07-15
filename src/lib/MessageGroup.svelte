<script lang="ts">
    import { goto } from "$app/navigation";
    import client from "./client";
    import type { CMessage, User } from "./domestique.ts/client";
    export let author: User;
    export let messages: CMessage[];

    const isBridge: boolean = author.username == 'fairlight';
    function getContent(content: string) {
        if (isBridge)
            content = content.replace(/^.+: /g,'');
        return content
    }
</script>

<div class="message-group">
    <div class="header">
        {#if isBridge}
            {(messages[0].content.match(/^(.+): /)??[])[1]} <div class="badge">BRIDGED</div>
        {:else}
            {author.username}
        {/if}
    </div>
    {#each messages as message}
        <div class="message">
            {getContent(message.content)}
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
        display: flex;
        align-items: center;
        gap: 1em;
    }
    .message {
        display: flex;
        justify-content: space-between;
    }
    .badge {
        display: inline-block;
        padding-inline: .5em;
        background: #ffc3f1;
        color: #3e303a;
        border-radius: 2em;
        font-size: .8em;
    }
</style>
