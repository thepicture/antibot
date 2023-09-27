"use strict";

module.exports = class Plugin {
  beforeFiltered(contents) {
    return contents;
  }

  afterFiltered(contents) {
    return contents;
  }
};
