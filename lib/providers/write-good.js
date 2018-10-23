const writeGood = require('write-good')

class WriteGood {
  /**
   * @constructor
   * @param {Map<string, string>} contentMap
   */
  constructor (contentMap) {
    this.contentMap = contentMap
  }
  /**
   * Returns the results of all the write-good checks
   * @param {Map<string, string>} fileMap
   * @returns {Map<string, object[]>}
   */
  buildResults () {
    const results = new Map()

    for (const [filename, contents] of this.contentMap) {
      results.set(filename, writeGood(contents))
    }

    return results
  }
}

module.exports = WriteGood
