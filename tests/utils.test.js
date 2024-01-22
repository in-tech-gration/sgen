const test = require("node:test");
const { deepStrictEqual } = require("node:assert");
const {
  getFrontMatterStringFromObject,
  parseWdxMetaProgress,
  parseWdxMetaTests,
} = require("../utils");

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

test("Testing 'parseWdxMetaProgress' with token without SGEN:META:PROGRESS tag", () => {
  const token1 = {
    raw: "Just a simple line from a markdown file.\n",
  };
  const output1 = { hasMeta: null, meta: null, raw: null };

  deepStrictEqual(parseWdxMetaProgress({ token: token1 }), output1);
});

test("Testing 'parseWdxMetaProgress' with token with SGEN:META:PROGRESS:task=Read 'Fundamental text and font styling' tag", () => {
  const token2 = {
    raw: "  <!-- SGEN:META:PROGRESS:task=Read 'Fundamental text and font styling' -->\n",
  };
  const output2 = {
    hasMeta: true,
    meta: {
      instructions: "Update FALSE to TRUE in the COMPLETED column",
      level: "Beginner",
      task: "Read 'Fundamental text and font styling'",
      raw: "  ",
    },
    raw: null,
  };

  deepStrictEqual(parseWdxMetaProgress({ token: token2 }), output2);
});

test("Testing 'parseWdxMetaProgress' with token with SGEN:META:PROGRESS:task=Complete 'Test your skills: Responsive web design and media queries'|user_folder=rwd_skills tag", () => {
  const token3 = {
    raw: "  <!-- SGEN:META:PROGRESS:task=Complete 'Test your skills: Responsive web design and media queries'|user_folder=rwd_skills -->\n",
  };
  const output3 = {
    hasMeta: true,
    meta: {
      instructions: "Update FALSE to TRUE in the COMPLETED column",
      level: "Beginner",
      task: "Complete 'Test your skills: Responsive web design and media queries'",
      user_folder: "rwd_skills",
      raw: "  ",
    },
    raw: null,
  };

  deepStrictEqual(parseWdxMetaProgress({ token: token3 }), output3);
});

// =================================================================

test("Testing 'parseWdxMetaTests' with token without SGEN:META:TESTS tag", () => {
  const token1 = {
    raw: "Just a simple line from a markdown file.\n",
  };
  const output1 = { hasMeta: null, meta: null, raw: null };

  deepStrictEqual(parseWdxMetaTests({ token: token1 }), output1);
});

test("Testing 'parseWdxMetaTests' with token with SGEN:META:TESTS:name=Test Exercise: 'Test your skills: Responsive web design and media queries'|type=exist|user_folder=rwd_skills|files=rwd-download.html tag", () => {
  const token2 = {
    raw: "  <!-- SGEN:META:TESTS:name=Test Exercise: 'Test your skills: Responsive web design and media queries'|type=exist|user_folder=rwd_skills|files=rwd-download.html -->\n",
  };
  const output2 = {
    hasMeta: true,
    meta: {
      name: "Test Exercise: 'Test your skills: Responsive web design and media queries'",
      type: "exist",
      user_folder: "rwd_skills",
      files: ["rwd-download.html"],
      raw: "  ",
    },
    raw: null,
  };

  deepStrictEqual(parseWdxMetaTests({ token: token2 }), output2);
});

// =================================================================
