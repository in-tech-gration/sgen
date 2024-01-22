const test = require("node:test");
const { equal, deepStrictEqual } = require("node:assert");
const {
  getYouTubeListIdParts,
  getFrontMatterStringFromObject,
} = require("../utils");

// =================================================================

test("Testing getYouTubeListIdParts()", () => {
  const input1 =
    "https://www.youtube.com/watch?v=JZXQ455OT3A&list=PL0Zuz27SZ-6PFkIxaJ6Xx_X46avTM1aYw&index=1&pp=iAQB";
  const output1 = [
    "https://www.youtube.com/watch?v=JZXQ455OT3A",
    "&list=PL0Zuz27SZ-6PFkIxaJ6Xx_X46avTM1aYw",
    "&index=1&pp=iAQB",
  ];
  deepStrictEqual(getYouTubeListIdParts(input1), output1);

  const input2 =
    "https://www.youtube.com/playlist?list=PL0Zuz27SZ-6PFkIxaJ6Xx_X46avTM1aYw";
  const output2 = [
    "https://www.youtube.com/playlist",
    "?list=PL0Zuz27SZ-6PFkIxaJ6Xx_X46avTM1aYw",
  ];
  deepStrictEqual(getYouTubeListIdParts(input2), output2);
});

// TODO: Test createFrontMatterMarkdownFromObject()
// =================================================================

test("Testing 'getFrontMatterStringFromObject' with empty object", () => {
  const fm1 = {};
  const output1 = "";

  deepStrictEqual(getFrontMatterStringFromObject(fm1), output1);
});

test("Testing 'getFrontMatterStringFromObject' with simple object of 2 entries", () => {
  const fm2 = { id: 1, title: "Test Simple Object" };
  const output2 = "---\nid: 1\ntitle: Test Simple Object\n---\n";

  deepStrictEqual(getFrontMatterStringFromObject(fm2), output2);
});

test("Testing 'getFrontMatterStringFromObject' with simple object of 2 entries and liveCodeEnabled", () => {
  const fm3 = { id: 1, title: "Test Simple Object" };
  const output3 =
    "---\nid: 1\ntitle: Test Simple Object\nload_script_js_via_src:\n  - flems/flems.html\n  - flems/flems_init.js\n---\n";

  // Test with simple object and live code enabled
  deepStrictEqual(getFrontMatterStringFromObject(fm3, true), output3);
});

// =================================================================
