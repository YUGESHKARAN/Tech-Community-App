import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { discussionPath, discussionShareData, shareDiscussion } from "./shareDiscussion.js";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");

function setBrowser(navigator) {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { location: { origin: "https://example.com" } },
  });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: navigator });
}

afterEach(() => {
  for (const [key, descriptor] of [["window", originalWindow], ["navigator", originalNavigator]]) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }
});

test("builds the existing discussion route and a concise share message", () => {
  setBrowser({});
  const data = discussionShareData("community 1", "thread/2", "A discussion", `# Heading\n[Read more](https://example.com) ${"x".repeat(220)}`);
  assert.equal(discussionPath("community 1", "thread/2"), "/discussion/community%201/thread%2F2");
  assert.equal(data.url, "https://example.com/discussion/community%201/thread%2F2");
  assert.equal(data.title, "A discussion");
  assert.ok(data.text.startsWith("Heading Read more "));
  assert.equal(data.text.length, 200);
  assert.ok(data.text.endsWith("…"));
  assert.throws(() => discussionShareData("community", "", "Title", ""), /unavailable/);
});

test("shares the title, excerpt, and exact discussion URL with the native share sheet", async () => {
  let shared;
  setBrowser({ share: async (data) => { shared = data; } });
  assert.equal(await shareDiscussion("community", "thread", "Title", "**Details**"), "shared");
  assert.deepEqual(shared, {
    title: "Title",
    text: "Details",
    url: "https://example.com/discussion/community/thread",
  });
});

test("copies the URL when native sharing is unavailable or unsupported", async () => {
  let copied;
  const clipboard = { writeText: async (text) => { copied = text; } };
  setBrowser({ clipboard });
  assert.equal(await shareDiscussion("community", "thread", "Title", ""), "copied");
  assert.equal(copied, "https://example.com/discussion/community/thread");
  setBrowser({ clipboard, share: () => { throw new Error("should not share"); }, canShare: () => false });
  assert.equal(await shareDiscussion("community", "thread", "Title", ""), "copied");
});

test("propagates cancellation and clipboard failures", async () => {
  const cancelled = Object.assign(new Error("Cancelled"), { name: "AbortError" });
  setBrowser({ share: async () => { throw cancelled; } });
  await assert.rejects(shareDiscussion("community", "thread", "Title", ""), { name: "AbortError" });
  setBrowser({ clipboard: { writeText: async () => { throw new Error("Denied"); } } });
  await assert.rejects(shareDiscussion("community", "thread", "Title", ""), /Denied/);
  setBrowser({});
  await assert.rejects(shareDiscussion("community", "thread", "Title", ""), /Clipboard is unavailable/);
});
