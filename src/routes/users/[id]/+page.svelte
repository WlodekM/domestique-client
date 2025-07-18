<script lang="ts">
    import client from "$lib/client";
    import requireLogin from "$lib/requireLogin";
	import { page } from "$app/stores";
    export let id: string;
	$: id = $page.params.id;
</script>
{#await requireLogin()}logging in...
{:then}
    {#await client.cache.getUser(id)}
        loading...
    {:then user}
        <h2>{user.displayName}</h2>
        <code>@{user.username}</code>
        <br>
        admin: {user.isAdmin ? 'yes' : 'no'}
        <br>
        verified: {user.verified ? 'yes' : 'no'}
    {:catch e}
        could not load user data
        <br>
        {e}
    {/await}
{/await}
