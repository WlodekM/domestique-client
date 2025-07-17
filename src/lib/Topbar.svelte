<script lang="ts">
    import { showNavbar } from "./stores";
</script>

{#if $showNavbar}
    <div class="navbar">
        <div class="left">
            chat domestique
        </div>
        <div class="pages">
            <a href="/guilds">guilds</a>
            <a href="/home">home</a>
            <a href="/" on:click={()=>localStorage.removeItem('token')}>log out</a>
        </div>
    </div>
{/if}

<style>
    .navbar {
        display: flex;
        justify-content: space-between;
    }
</style>
