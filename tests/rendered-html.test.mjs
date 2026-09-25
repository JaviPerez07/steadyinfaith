import assert from "node:assert/strict";
import test from "node:test";

const COMMUNITY_URL = "https://www.skool.com/steady-in-faith-9349";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );

  return { response, html: await response.text() };
}

test("serves the landing page as HTML", async () => {
  const { response } = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
});

test("declares English as the document language", async () => {
  const { html } = await render();
  assert.match(html, /<html[^>]*\blang=["']en["']/i);
});

test("points every external CTA at the free Skool community", async () => {
  const { html } = await render();
  const hrefs = [...html.matchAll(/<a\b[^>]*href="(https:\/\/[^"]*)"/g)].map((m) => m[1]);
  assert.ok(hrefs.length >= 2, `expected at least 2 external CTAs, found ${hrefs.length}`);
  for (const href of hrefs) {
    assert.equal(href, COMMUNITY_URL);
  }
});

test("keeps the free Reset and marks the paid edition as unavailable", async () => {
  const { html } = await render();
  assert.match(html, /BEGIN THE RESET — FREE/i);
  assert.match(html, /Planned regular price/);
  assert.match(html, /<s>\$20<\/s>/);
  assert.match(html, /\$14/);
  assert.match(html, /<button[^>]*disabled/);
  assert.match(html, /Not available to purchase yet/);
});

test("does not revive the retired paid offer", async () => {
  const { html } = await render();
  assert.doesNotMatch(html, /buy\.stripe\.com/i);
  assert.doesNotMatch(html, /\$(?:9|17)\b/);
  assert.doesNotMatch(html, /founding|90 days/i);
});

test("does not ship the preview-only build marker", async () => {
  const { html } = await render();
  assert.doesNotMatch(html, /codex-preview/i);
});
