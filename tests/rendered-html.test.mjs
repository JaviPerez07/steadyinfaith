import assert from "node:assert/strict";
import test from "node:test";

const CHECKOUT_URL = "https://buy.stripe.com/4gM4gz4rxfXY58b8kL9fW0M";

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

test("points every checkout link at the Stripe payment link", async () => {
  const { html } = await render();
  const hrefs = [...html.matchAll(/href="(https:\/\/buy\.stripe\.com[^"]*)"/g)].map((m) => m[1]);
  assert.ok(hrefs.length >= 3, `expected at least 3 checkout links, found ${hrefs.length}`);
  for (const href of hrefs) {
    assert.equal(href, CHECKOUT_URL);
  }
});

test("states the offer: $17 struck through, $9 now, one-time, 90 community days", async () => {
  const { html } = await render();
  assert.match(html, /\$17/);
  assert.match(html, /\$9/);
  assert.match(html, /ONE-TIME PAYMENT/i);
  assert.match(html, /90 days of private community access/i);
  assert.match(html, /You will not be enrolled in a recurring subscription/i);
});

test("does not ship the preview-only build marker", async () => {
  const { html } = await render();
  assert.doesNotMatch(html, /codex-preview/i);
});
