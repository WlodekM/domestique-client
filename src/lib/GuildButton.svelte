<script lang="ts">
    import { goto } from "$app/navigation";
    import client from "./client";
    export let guildId: string;
    let opened: boolean = false;
</script>

{#await client.guilds.get(guildId)}
    loading...
{:then guild}
    <details on:toggle={(e) => opened = e.currentTarget.open}>
        <summary>{guild.name}</summary>
        {guild.topic}
        <br>
        channels:
        <br>
        <ul>
            <li>
                {#if opened}
                    {#each guild._channels as channelId}
                        {#await guild.channels.get(channelId)}
                            loading channel...
                        {:then channel} 
                            <button
                                on:click={()=>goto(`/channels/${guildId}/${channelId}`)}
                                >#{channel.name}</button> {channel.topic}
                        {:catch error}
                            error: {error}
                        {/await}
                    {/each}
                {/if}
            </li>
        </ul>
    </details>
{:catch error}
    Error when loading guild<br>{error}
{/await}
