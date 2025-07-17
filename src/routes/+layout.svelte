<script>
	import Topbar from "$lib/Topbar.svelte";
	import './global.css'
</script>
<div class="page">
	<Topbar />
	<slot></slot>
</div>

<style>
	.page {
		max-height: calc(100vh - 16px);
		display: flex;
		flex-direction: column;
		padding: 8px;
	}
</style>
