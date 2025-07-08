<script lang="ts">
    import { showNavbar } from "./stores";
</script>

{#if $showNavbar}
    <div class="navbar">
        <div class="left">
            chat domestique
        </div>
        <div class="pages"></div>
    </div>
{/if}
