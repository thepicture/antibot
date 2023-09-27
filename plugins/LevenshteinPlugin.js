"use strict";

const Plugin = require("./Base");
const calculateDistance = require("../lib/levenshtein");

module.exports = class LevenshteinPlugin extends Plugin {
  #sensitivity = 1;

  constructor({ sensitivity } = { sensitivity: 1 }) {
    super();

    this.#sensitivity = sensitivity;
  }

  onDetection(text, dict) {
    for (const value of Object.values(dict)) {
      const distance = calculateDistance(text, value);

      if (distance <= this.#sensitivity) {
        return true;
      }
    }

    return false;
  }
};
