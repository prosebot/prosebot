const writeGood = require("write-good");
const findLineColumn = require("../find-line-column");

class WriteGood {
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
   * @param {string} contents
   */
  serializeReasons(reasons, contents) {
    return reasons.map((reason) => {
      const { line } = findLineColumn(contents, reason.index);
      return { line, reason: reason.reason };
    });
  }

  /**
   * Returns the results of all the write-good checks
   * @param {Map<string, string>} fileMap
   * @returns {Map<string, object[]>}
   */
  buildResults() {
    const results = new Map();

    for (const [filename, contents] of this.contentMap) {
      const reasons = writeGood(contents);
      results.set(filename, this.serializeReasons(reasons, contents));
    }

    return results;
  }
}

module.exports = WriteGood;
