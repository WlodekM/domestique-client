<!-- code yoinked from meower svelte, license below -->
<!--
MIT License

Copyright (c) 2023 Meower Media

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
-->
<!--
	Component that powers load more-able lists like home.
	Customizable!

	Parameters:
	- items: An array of items, which can be modified if you want.
	- loadPage: A function that takes a (page: number) and should return a {numPages: number, result: *[]}.
		The component will call this multiple times if needed.
	- addItem (const): A function that can be called to add an item to the front of the list,
		incrementing the offset.
	- itemsPerPage: The number of items per page (default 25).
	Slots:
	- empty: Shown if the list has no items.
	- loaded: Shown if the list has items. Has an (items: *[]) parameter.
	- item: If `loaded` is not specified, shown for each item of the list. 
		Has the parameters (items: *[], item: *).
	- error: Shown if an error occurs while loading the list.
-->
<script lang="ts">
	import Loading from "./Loading.svelte";

	export let items: object[] = [];
    interface Page {
		numPages: number,
		result: any[]
	}
	export let loadPage: (_page: number) => (Page|Promise<Page>) = async (_page: number) => {throw 'BITCH!!!'};

	export let maxItems: number = Infinity;

	/**
	 * Adds a item to the list.
	 */
	export const addItem = function (item: any) {
		id++;
		items.unshift({
			id,
			...item,
		});

		if (items.length > maxItems) {
			items.pop();
			itemOffset--;
		}

		items = items;
		itemOffset++;
	};

	export let itemsPerPage = 25;

	let id = 0;

	async function loadPageWithOverflow(page: number) {
		pageLoading = true;

		try {
			// Some amount of items per page...
			let realOffset = itemOffset % itemsPerPage;

			const first = await loadPage(page);

			let realItems = first.result;
			realItems.splice(0, realOffset);

			numPages = first.numPages;

			let overflow;
			// Occasionally, 2 pages will have to be loaded
			// so Load More loads {itemsPerPage} posts
			// This happens if an item is dynamically
			// added to the list
			if (realOffset > 0 && pagesLoaded < numPages) {
				overflow = await loadPage(page + 1);
				numPages = overflow.numPages;

				realItems = realItems.concat(
					overflow.result.slice(0, realOffset)
				);
			}

			items = items.concat(realItems);
			pagesLoaded = page;
			return items.map(o => {
				id++;
				return {
					id,
					...o,
				};
			});
		} finally {
			pageLoading = false;
		}
	}

	let pagesLoaded = 0;
	let pageLoading = false;
	let numPages: number | null = null;

	// Some pages add items dynamically.
	// Store the offset of dynamically added items
	// so Load More loads the right page(s)
	let itemOffset = 0;
</script>

<div>
	{#await loadPageWithOverflow(1)}
		<div class="center loading-start">
			<Loading />
		</div>
	{:then}
		{#if !items || items.length === 0}
			<slot name="empty" />
		{:else}
			<slot name="loaded" {items}>
				{#each items as item}
					<slot name="item" {item} {items} />
				{/each}
			</slot>

			<div class="center">
				{#if pageLoading}
					<div class="loading-page">
						<Loading />
					</div>
				{:else if numPages && numPages > pagesLoaded}
					<button
						class="load-more"
						on:click={() => loadPageWithOverflow(pagesLoaded + 1)}
					>
						Load More
					</button>
				{/if}
			</div>
		{/if}
	{:catch error}
		<slot name="error" {error} />
	{/await}
</div>

<style>
	.center {
		text-align: center;
	}

	.load-more {
		width: 100%;
		margin-bottom: 2em;
	}

	.loading-start {
		margin-top: 2em;
	}

	.loading-page {
		margin-bottom: 0.5em;
	}
</style>