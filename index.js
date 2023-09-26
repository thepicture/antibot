const compose =
  (...fns) =>
  (input) =>
    fns.reverse().reduce((acc, val) => val(acc), input);

const trim = (text) => text.trim();
const lower = (text) => text.toLowerCase();

class Plugin {
  beforeFiltered(contents) {
    return contents;
  }

  afterFiltered(contents) {
    return contents;
  }
}

class Spamfilter {
  #dict = {};
  #tree = {};
  #plugins = [];
  #options;
  #contents = [];

  constructor(contents = [], options) {
    this.#options = options;

    contents.forEach((content) => this.#ban(content));
  }

  test(content) {
    const matched =
      this.#options?.onDetection?.(content, this.#dict) ??
      (!content ||
        !!this.#dict[lower(content)] ||
        this.#contents.some((spam) => lower(content).includes(spam)));

    if (content && matched) {
      this.#ban(content);
    }

    return matched;
  }

  explain() {
    return this.#tree;
  }

  inject(plugin) {
    if (!(plugin instanceof Plugin)) {
      throw new Error("Plugin instance expected");
    }

    this.#plugins.push(plugin);
  }

  #ban(
    content,
    tactic = (content) => content.split(" ").map(compose(trim, lower))
  ) {
    const { skipOnFilteredOnInit, onFiltered } = this.#options ?? {};

    let words = content;

    for (const plugin of this.#plugins) {
      words = plugin.beforeFiltered(words);
    }

    words = ((!skipOnFilteredOnInit && onFiltered) || tactic)(words);

    for (const plugin of this.#plugins) {
      words = plugin.afterFiltered(words);
    }

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
}

module.exports = {
  Spamfilter,
  Plugin,
  create: (contents, options) => new Spamfilter(contents, options),
  plugin: (params) => new Plugin(params),
};
