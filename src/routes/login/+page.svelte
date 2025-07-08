<script lang="ts">
    let username: string = '',
        password: string = '';
    let statusText: HTMLSpanElement;
    function login(e: Event) {
        e.preventDefault();
        statusText.innerText = 'uh'
    }
</script>

<center>
<form>
    <input
        type="text"
        name="username"
        id="username"
        bind:value={username}
        placeholder="username...."
        >
    <br>
    <input
        type="password"
        name="password"
        id="password"
        bind:value={password}
        placeholder="password..."
        >
    <br>
    <button on:click={login}>log in</button>
    <br>
    <span bind:this={statusText}></span>
</form>
</center>
