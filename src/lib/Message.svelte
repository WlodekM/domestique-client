<script lang="ts">
    import type { CMessage, User } from "./domestique.ts/client";
    import { md } from "./markdown";
    export let author: User;
    export let message: CMessage;

    const isBridge: boolean = author.username == 'fairlight';
    function getContent(content: string) {
        if (isBridge)
            content = content.replace(/^.+: /g,'');
        const tokens = md.parse(content, {});
        for (const token of tokens) {
            if (token.children) {
                for (const childToken of token.children) {
                    if (childToken.type === "image") {
                        const srcPos = childToken.attrs.findIndex(
                            (attr: string[]) => attr[0] === "src"
                        );
                        childToken.attrs[srcPos][1] = "about:blank";
                        // if (
                        //     !IMAGE_HOST_WHITELIST.some(o => {
                        //             try {
                        //                 const url = new URL(childToken.attrs[srcPos][1])
                        //                 return url.host == o
                        //             } catch (error) {
                                        
                        //             }
                        //         }
                        //     )
                        // ) {
                        //     console.log(childToken, IMAGE_HOST_WHITELIST, childToken.attrs[srcPos][1]);
                        //     childToken.attrs[srcPos][1] = "about:blank";
                        // }
                    }
                    if (childToken.type === "link_open") {
                        const href = childToken.attrs.find(
                            (attr: string[]) => attr[0] === "href"
                        )[1];
                        const b64href = btoa(href);
                        childToken.attrs.push([
                            "onclick",
                            `return confirmLink('${b64href}')`,
                        ]);
                    }
                }
            }
        }
        return md.renderer.render(tokens, md.options, {});
    }
</script>
<div class="message">
    <div class="message-content">
        {@html getContent(message.content)}
    </div>
    <span class="timestamp">
        {message.timestamp.getHours().toString().padStart(2,'0')}:{message.timestamp.getMinutes().toString().padStart(2,'0')}
    </span>
</div>
<style>
    .message {
        display: flex;
        justify-content: space-between;
    }
    .message-content :global(p) {
        margin: 0;
    }
    .message-content :global(p:has(+p)) {
        margin-bottom: 1em;
    }
</style>
