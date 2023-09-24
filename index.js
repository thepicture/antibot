const compose =
  (...fns) =>
  (input) =>
    fns.reverse().reduce((acc, val) => val(acc), input);

const trim = (text) => text.trim();
const lower = (text) => text.toLowerCase();

const Spamfilter = class Spamfilter {
  #dict;
  #tree;
  #options;
  #contents;

  constructor(contents = [], options) {
    this.#dict = {};
    this.#tree = {};
    this.#contents = [];
    this.#options = options;

    contents.forEach((content) => this.#ban(content));
  }

  test(content) {
    const matched =
      !content ||
      !!this.#dict[lower(content)] ||
      this.#contents.some((spam) => lower(content).includes(spam));

    if (content && matched) {
      this.#ban(content);
    }

    return matched;
  }

  explain() {
    return this.#tree;
  }

  #ban(
    content,
    tactic = (content) => content.split(" ").map(compose(trim, lower))
  ) {
    const { skipOnFilteredOnInit, onFiltered } = this.#options ?? {};

    const words = ((!skipOnFilteredOnInit && onFiltered) || tactic)(content);

    if (skipOnFilteredOnInit) {
      this.#options.skipOnFilteredOnInit = false;
    }

    let node = this.#tree;

    words.forEach((word) => {
      if (!node[word]) {
        node[word] = {};
      }

      node = node[word];
    });

    this.#contents.push(...words);

    words.forEach((word) => {
      this.#dict[word] = word;
    });
  }
};

module.exports = {
  Spamfilter,
  create: (contents, options) => new Spamfilter(contents, options),
};
