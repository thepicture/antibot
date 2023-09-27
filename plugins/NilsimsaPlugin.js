"use strict";

const Plugin = require("./Base");
const { Nilsimsa } = require("../lib/nilsimsa");

module.exports = class LevenshteinPlugin extends Plugin {
  #from = 64;
  #to = 128;

  constructor({ from, to } = { from: 64, to: 128 }) {
    super();

    this.#from = from;
    this.#to = to;
  }

  onDetection(text, dict) {
    for (const value of Object.values(dict)) {
      const distance = Nilsimsa.compare(
        ...[text, value].map((entry) => new Nilsimsa(entry).digest("hex"))
      );

      if (distance >= this.#to && distance <= this.#from) {
        return true;
      }
    }

    return false;
  }
};
