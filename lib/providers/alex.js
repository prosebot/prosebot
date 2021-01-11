const alex = require("alex");

class Alex {
  /**
   * @constructor
   * @param {Map<string, string>} contentMap
   */
  constructor(contentMap) {
    this.contentMap = contentMap;
  }

  /**
   * Serialize the provider lib's response into a { line, reason } object
   * @param {object[]} reasons
   */
  serializeReasons(reasons) {
    return reasons.map((reason) => ({
      line: reason.line,
      reason: reason.message,
      annotation_level: reason.fatal ? "failing" : "warning",
    }));
  }

  /**
   * Returns the results of all the write-good checks
   * @param {Map<string, string>} fileMap
   * @returns {Map<string, object[]>}
   */
  buildResults() {
    const results = new Map();

    for (const [filename, contents] of this.contentMap) {
      const res = alex.markdown(contents).messages;
      results.set(filename, this.serializeReasons(res));
    }

    return results;
  }
}

module.exports = Alex;
