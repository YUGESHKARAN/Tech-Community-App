import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { communityPath, communityShareData, shareCommunity } from "./shareCommunity.js";

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

test("shares the existing community route with its name and a concise description", () => {
  setBrowser({});
  const data = communityShareData("community 1", "Testing", `# Welcome\n[Learn more](https://example.com) ${"x".repeat(220)}`, "Tagline");
  assert.equal(communityPath("community 1"), "/techCommunityDetails/community%201");
  assert.equal(data.url, "https://example.com/techCommunityDetails/community%201");
  assert.equal(data.title, "Testing");
  assert.ok(data.text.startsWith("Welcome Learn more "));
  assert.equal(data.text.length, 200);
  assert.ok(data.text.endsWith("…"));
  assert.throws(() => communityShareData("", "Testing", "", ""), /unavailable/);
  assert.throws(() => communityShareData("community", "", "", ""), /unavailable/);
});

test("falls back to the tagline when there is no usable description", () => {
  setBrowser({});
  assert.equal(communityShareData("id", "Testing", "  ", "**Tagline**").text, "Tagline");
  assert.equal(communityShareData("id", "Testing", "", "").text, "");
});

test("uses native sharing, or copies the exact URL when it is unsupported", async () => {
  let shared;
  setBrowser({ share: async (data) => { shared = data; } });
  assert.equal(await shareCommunity("id", "Testing", "Details", ""), "shared");
  assert.deepEqual(shared, {
    title: "Testing",
    text: "Details",
    url: "https://example.com/techCommunityDetails/id",
  });

  let copied;
  const clipboard = { writeText: async (text) => { copied = text; } };
  setBrowser({ clipboard, share: () => { throw new Error("should not share"); }, canShare: () => false });
  assert.equal(await shareCommunity("id", "Testing", "", ""), "copied");
  assert.equal(copied, "https://example.com/techCommunityDetails/id");
});

test("propagates share cancellation and clipboard errors", async () => {
  const cancelled = Object.assign(new Error("Cancelled"), { name: "AbortError" });
  setBrowser({ share: async () => { throw cancelled; } });
  await assert.rejects(shareCommunity("id", "Testing", "", ""), { name: "AbortError" });
  setBrowser({ clipboard: { writeText: async () => { throw new Error("Denied"); } } });
  await assert.rejects(shareCommunity("id", "Testing", "", ""), /Denied/);
  setBrowser({});
  await assert.rejects(shareCommunity("id", "Testing", "", ""), /Clipboard is unavailable/);
});
