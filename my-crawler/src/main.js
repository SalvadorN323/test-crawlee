import { PlaywrightCrawler, Dataset } from 'crawlee';

const crawler = new PlaywrightCrawler({
	async requestHandler(context) {
		console.log(`Processing ${context.request.url}`);
		// Find links matching the selector
		const linkElements = await context.page.$$('[slot="full-post-link"]');
		const hrefs = [];
		for (const el of linkElements) {
			const href = await el.getAttribute('href');
			if (href) hrefs.push(href);
		}
		console.log(`Found ${hrefs.length} links with selector 'a[slot="full-post-link"]':`, hrefs);
		// Enqueue links and log what gets enqueued
		const enqueued = await context.enqueueLinks({
			selector: 'a[slot="full-post-link"]',
			globs: ['**/comments/**'], // succeeds

		});
		if (enqueued.length) {
			console.log(`Enqueued ${enqueued.length} links:`);
			for (const req of enqueued) {
				console.log(`  - ${req.url}`);
			}
		} else {
			console.log('No links enqueued.');
		}
		console.log(`Finished processing ${context.request.url}`);
	},
	headless: false,
	maxRequestsPerCrawl: 20,
	launchContext: {
		launchOptions: {
			slowMo: 500,
		},
	},
});

await crawler.run(['https://reddit.com/r/legal']); // note: this is missing "www."