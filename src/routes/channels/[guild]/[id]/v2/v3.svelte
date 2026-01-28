<script lang="ts">
	import PagedList from "$lib/PagedList.svelte";
	import MessageGroup from "$lib/MessageGroup.svelte";
	import client from "$lib/client";
	import { page } from "$app/stores";
	let channel_id: string;
	$: channel_id = $page.params.id;
	let guild_id: string;
	$: guild_id = $page.params.guild;

	let addItem: ((item: any) => void);
    interface Page {
		numPages: number,
		result: any[]
	}
</script>

<PagedList bind:addItem {loadPage}></PagedList>
