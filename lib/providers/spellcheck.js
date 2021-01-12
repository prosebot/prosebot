const spellchecker = require('spellchecker')
const findLineColumn = require('../find-line-column')
const markdown = require('markdown-spellcheck').default

class SpellCheck {
  /**
   * @constructor
   * @param {Map<string, string>} contentMap
   */
  constructor(contentMap) {
    this.contentMap = contentMap
    this.spellchecker = spellchecker
  }

  buildReasonString(word) {
    // Use `spellchecker` for corrections because `markdown-spellcheck`'s API does not export properly
    const corrections = this.spellchecker
      .getCorrectionsForMisspelling(word)
      .slice(0, 6)
    return `"${word}" is misspelled. ${
      corrections.length ? `How about: ${corrections.join(', ')}` : ''
    }`
  }

  /**
   * Serialize the provider lib's response into a { line, reason } object
   * @param {object[]} reasons
   * @param {string} contents
   */
  serializeReasons(reasons, contents) {
    return reasons.map((reason) => {
      const { line } = findLineColumn(contents, reason.index)
      return { line, reason: this.buildReasonString(reason.word) }
    })
  }

  /**
   * Returns the results of all the write-good checks
   * @param {Map<string, string>} fileMap
   * @returns {Map<string, object[]>}
   */
  buildResults() {
    const results = new Map()

    for (const [filename, contents] of this.contentMap) {
      const reasons = markdown.spell(contents)
      results.set(filename, this.serializeReasons(reasons, contents))
    }

    return results
  }
}

module.exports = SpellCheck
