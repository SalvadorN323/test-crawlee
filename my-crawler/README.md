# Crawlee + PlaywrightCrawler + JavaScript project

## Purpose

This project demonstrates and helps debug a specific issue with Crawlee's `context.enqueueLinks` method when crawling URLs that redirect from non-www to www (e.g., `https://reddit.com/r/legal`). The code includes detailed logging to show:
- When each page is processed
- Which links are found by the selector
- Which links are actually enqueued by Crawlee

This setup is useful for replicating and investigating the behavior where links may not be enqueued due to strict glob patterns that do not account for www redirects.

---

## Issue Replication and Workaround

### Observed Issue
- When starting a crawl at a non-www URL (e.g., `https://reddit.com/r/legal`), the site redirects to a www-prefixed URL (e.g., `https://www.reddit.com/r/legal`).
- Crawlee's default glob pattern for `enqueueLinks` is strict and does not match the new www-prefixed URLs after redirect.
- As a result, links found by the selector are **not enqueued** ("No links enqueued.").

### Workaround
- By specifying a permissive glob pattern, e.g., `globs: ['**/comments/**']`, you allow Crawlee to enqueue the intended links regardless of the www prefix.
- With this glob, links are enqueued as expected, and the crawler processes them.

### How to Interpret the Logs
- The log will show how many links are found by the selector on each page.
- If the glob is not set, you may see many links found but "No links enqueued." (the bug).
- If the glob is set, you will see links being enqueued and processed (workaround works).
- The `maxRequestsPerCrawl` setting limits how many requests are processed in total (default in this project: 5).

---

## www vs non-www and glob behavior

The code now includes four test cases to demonstrate the difference between using www and non-www start URLs, and between using globs and the default glob:

| Start URL                          | Glob used           | Redirect? | Links enqueued? (default glob) | Links enqueued? (`**/comments/**` glob) |
|-------------------------------------|---------------------|-----------|-------------------------------|-----------------------------------------|
| https://reddit.com/r/dogs           | no www, with globs  | Yes       | ❌ (not enqueued)              | ✅ (enqueued)                            |
| https://reddit.com/r/legal          | no www, with globs  | Yes       | ❌ (not enqueued)              | ✅ (enqueued)                            |
| https://www.reddit.com/r/dogs       | www, default glob   | No        | ✅ (enqueued)                  | ✅ (enqueued)                            |
| https://www.reddit.com/r/legal      | www, default glob   | No        | ✅ (enqueued)                  | ✅ (enqueued)                            |

- When using a permissive glob (`**/comments/**`), links are enqueued regardless of www.
- When using the default glob, links are only enqueued if the start URL includes www (no redirect).

### How to see this in action
- Run the project. The logs will clearly indicate which test is running, which glob is used, and whether links are enqueued for each subreddit and URL variant.
- This helps you observe the effect of www vs non-www and glob settings on Crawlee's link enqueuing behavior.

---

This template is a production ready boilerplate for developing with `PlaywrightCrawler`. Use this to bootstrap your projects using the most up-to-date code.

If you're looking for examples or want to learn more visit:

- [Documentation](https://crawlee.dev/js/api/playwright-crawler/class/PlaywrightCrawler)
- [Examples](https://crawlee.dev/js/docs/examples/playwright-crawler)
