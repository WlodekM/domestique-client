<script>
    import requireLogin from "$lib/requireLogin";
	import Topbar from "$lib/Topbar.svelte";
	import './global.css';
	import { page } from "$app/stores";
	console.log($page.route.id)
	const readyPromise = $page.route.id == '/login' ? new Promise((r)=>{r('meow')}) : requireLogin();
</script>
<div class="page">
	{#await readyPromise}
		logging in
	{:then}
		<Topbar />
		<slot></slot>
	{/await}
</div>

<style>
	.page {
		max-height: calc(100vh - 16px);
		display: flex;
		flex-direction: column;
		padding: 8px;
	}
</style>
