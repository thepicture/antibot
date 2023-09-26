const assert = require("node:assert");
const { describe, it } = require("node:test");
const spamfilter = require("..");

describe("spamfilter", () => {
  it("should instantiate when called .create()", () => {
    const expected = true;

    const actual = spamfilter.create() instanceof spamfilter.Spamfilter;

    assert.strictEqual(actual, expected);
  });

  it("should ban text when matches with given text", () => {
    const expected = true;
    const instance = spamfilter.create(["spam"]);

    const actual = instance.test("spam");

    assert.strictEqual(actual, expected);
  });

  it("should ban text when prefix matching with given text", () => {
    const expected = true;
    const instance = spamfilter.create(["spam"]);

    const actual = instance.test("spam123");

    assert.strictEqual(actual, expected);
  });

  it("should ban text when postfix matching with given text", () => {
    const expected = true;
    const instance = spamfilter.create(["spam"]);

    const actual = instance.test("123spam");

    assert.strictEqual(actual, expected);
  });

  it("should ban text when matching anywere within given text", () => {
    const expected = true;
    const instance = spamfilter.create(["spam"]);

    const actual = instance.test("123spam123");

    assert.strictEqual(actual, expected);
  });

  it("should not ban text when not matching within given text", () => {
    const expected = false;
    const instance = spamfilter.create(["spam"]);

    const actual = instance.test("123spa_m123");

    assert.strictEqual(actual, expected);
  });

  it("should ban text when nothing given in params", () => {
    const expected = true;
    const instance = spamfilter.create(["spam"]);

    const actual = instance.test();

    assert.strictEqual(actual, expected);
  });

  it("should ban text without respect to casing", () => {
    const expected = true;
    const instance = spamfilter.create(["spam"]);

    const actual = instance.test("SPAM");

    assert.strictEqual(actual, expected);
  });

  it("should ban consequent text when matched before", () => {
    const expected = true;
    const instance = spamfilter.create(["spam"]);

    instance.test("SPAM filter");
    const actual = instance.test("FILTER");

    assert.strictEqual(actual, expected);
  });

  it("should allow to set autotrain tactic with skipping first onFiltered", () => {
    const expected = true;
    const instance = spamfilter.create(["spam"], {
      onFiltered: (spam) =>
        spam.split(" ").flatMap((word) => [`_${word}_`, `-${word}-`]),
      skipOnFilteredOnInit: true,
    });

    instance.test("SPAM filter");
    const actual1 = instance.test("_FILTER_");
    const actual2 = instance.test("-FILTER-");
    const actual3 = instance.test("FILTER");

    assert.strictEqual(actual1, expected);
    assert.strictEqual(actual2, expected);
    assert.notStrictEqual(actual3, expected);
  });

  it("should allow to set autotrain tactic without skipping first onFiltered", () => {
    const expected = true;
    const instance = spamfilter.create(["spam"], {
      onFiltered: (spam) =>
        spam.split(" ").flatMap((word) => [`_${word}_`, `-${word}-`]),
    });

    instance.test("-SPAM- filter");
    const actual = instance.test("_FILTER_");

    assert.strictEqual(actual, expected);
  });

  it("should build reason tree", () => {
    const expected = {
      spam: {
        filter: {},
        test: {},
      },
      filter: {
        word: {},
      },
    };
    const instance = spamfilter.create(["spam"]);

    instance.test("SPAM filter");
    instance.test("filter word");
    instance.test("spam test");
    const actual = instance.explain();

    assert.deepStrictEqual(actual, expected);
  });

  it("should instantiate plugin", () => {
    const expected = true;

    const actual =
      new (class extends spamfilter.Plugin {
        afterFiltered(contents) {
          return contents;
        }
      })() instanceof spamfilter.Plugin;

    assert.strictEqual(actual, expected);
  });

  it("should inject plugins after filtered to Spamfilter", () => {
    const expected = true;
    const plugin = new (class extends spamfilter.Plugin {
      afterFiltered(contents) {
        return contents.map((word) => word.split("").reverse().join(""));
      }
    })();
    const filter = spamfilter.create(["test"]);
    filter.inject(plugin);

    filter.test("test");
    const actual = filter.test("TSET");

    assert.strictEqual(actual, expected);
  });

  it("should inject plugins before filtered to Spamfilter", () => {
    const expected = true;
    const plugin = new (class extends spamfilter.Plugin {
      beforeFiltered(content) {
        return content.split("").reverse().join("");
      }
    })();
    const filter = spamfilter.create(["123"]);
    filter.inject(plugin);

    filter.test("123");
    const actual = filter.test("321");

    assert.strictEqual(actual, expected);
  });

  it("should override detection behavior", () => {
    const expected = true;

    const filter = spamfilter.create(["123"], {
      onDetection: (text, dict) => Object.keys(dict).length === text.length,
    });

    const actual = filter.test("3");

    assert.strictEqual(actual, expected);
  });
});
