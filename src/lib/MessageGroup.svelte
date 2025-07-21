<script lang="ts">
    import { goto } from "$app/navigation";
    import client from "./client";
    import type { CMessage, User } from "./domestique.ts/client";
    import Message from "./Message.svelte";
    export let author: User;
    export let messages: CMessage[];

    const isBridge: boolean = author.username == 'fairlight';
    function getContent(content: string) {
        if (isBridge)
            content = content.replace(/^.+?: /g,'');
        return content
    }
</script>

<div class="message-group">
    <div class="header">
        {#if isBridge}
        {(messages[0].content.match(/^(.+): /)??[])[1]} <div class="badge">BRIDGED</div>
        {:else}
            <a href="/users/{messages[0]._author}" title="@{author.username}" style="color:#ffc3f1">
                {author.displayName}
            </a>
        {/if}
    </div>
    {#each messages as message}
        <Message author={author} message={message} />
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
    .badge {
        display: inline-block;
        padding-inline: .5em;
        background: #ffc3f1;
        color: var(--bg);
        border-radius: 2em;
        font-size: .8em;
    }
</style>
