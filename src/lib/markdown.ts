/*
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/atom-one-dark.css">
	<script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/dist/markdown-it.min.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/markdown-it-mark@4.0.0/dist/markdown-it-mark.min.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.js"></script>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css">
	<script>
		globalThis.require = () => {
			return katex
		}
		globalThis.module = {}
	</script>
	<script src="https://cdn.jsdelivr.net/npm/markdown-it-katex@2.0.3/index.min.js"></script>
	<script>
		globalThis.markdownitKaTeX = globalThis.module.exports
	</script>*/

//@ts-nocheck: this shit's fucked
import hljs from 'highlight.js';
import markdownit from 'markdown-it';
import markdownitMark from 'markdown-it-mark';
import katex from 'katex';
globalThis.katex = katex;
declare global {
	let require: () => any;
	let module: any;
}
window.require = () => {
	return katex
}
if (!window.module)
	window.module = {}
await import('https://cdn.jsdelivr.net/npm/markdown-it-katex@2.0.3/index.min.js')
const markdownitKaTeX = window.module.exports
export const md = markdownit("default", {
	highlight: function (str: string, lang: string) {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(str, { language: lang }).value;
			} catch (__) { }
		}

		return ''; // use external default escaping
	},
	html: false,
	linkify: true,
	typographer: false,
	breaks: true
});
md.use(markdownitMark);
md.use(markdownitKaTeX, { throwOnError: false, katex });
// md.use((md) => {
// 	const defaultRender = md.renderer.rules.text || ((tokens, idx) => tokens[idx].content)

// 	md.renderer.rules.text = (tokens, idx, options, env, self) => {
// 		const token = tokens[idx]
// 		return defaultRender(tokens, idx, options, env, self).replace(/\n/g, '<br>\n')
// 	}
// })
