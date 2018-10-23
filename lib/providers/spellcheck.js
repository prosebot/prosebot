const spellchecker = require('spellchecker')
const findLineColumn = require('../find-line-column')

class SpellCheck {
  /**
   * @constructor
   * @param {Map<string, string>} contentMap
   */
  constructor (contentMap) {
    this.contentMap = contentMap
  }

  buildReasonString (contents, start, end) {
    const word = contents.substring(start, end)
    const corrections = spellchecker.getCorrectionsForMisspelling(word).slice(0, 6)
    return `${word} is misspelled. ${corrections.length ? `How about: ${corrections.join(', ')}` : ''}`
  }

  /**
   * Serialize the provider lib's response into a { line, reason } object
   * @param {object[]} reasons
   * @param {string} contents
   */
  serializeReasons (reasons, contents) {
    return reasons.map(reason => {
      const { line } = findLineColumn(contents, reason.start)
      return { line, reason: this.buildReasonString(contents, reason.start, reason.end) }
    })
  }

  /**
   * Returns the results of all the write-good checks
   * @param {Map<string, string>} fileMap
   * @returns {Map<string, object[]>}
   */
  buildResults () {
    const results = new Map()

    for (const [filename, contents] of this.contentMap) {
      const reasons = spellchecker.checkSpelling(contents)
      results.set(filename, this.serializeReasons(reasons, contents))
    }

    return results
  }
}

module.exports = SpellCheck
