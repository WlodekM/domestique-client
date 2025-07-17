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
		max-height: 100vh;
		display: flex;
		flex-direction: column;
		padding: 8px;
	}
</style>
