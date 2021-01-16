const { spell, spellcheck } = require('@prosebot/markdown-spellcheck')
const findLineColumn = require('../find-line-column')

class SpellCheck {
  /**
   * @constructor
   * @param {Map<string, string>} contentMap
   */
  constructor(contentMap) {
    this.contentMap = contentMap
    this.suggestCorrections = spellcheck.suggest
  }

  async buildReasonString(word) {
    const corrections = (await this.suggestCorrections(word)).slice(0, 5)
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
    return reasons.map(async ({ index, word }) => {
      const { line } = findLineColumn(contents, index)
      const reason = await this.buildReasonString(word)
      return { line, reason }
    })
  }

  /**
   * Returns the results of all the write-good checks
   * @param {Map<string, string>} fileMap
   * @returns {Map<string, object[]>}
   */
  async buildResults() {
    const results = new Map()

    for (const [filename, contents] of this.contentMap) {
      const reasons = await spell(contents)
      results.set(
        filename,
        await Promise.all(this.serializeReasons(reasons, contents))
      )
    }

    return results
  }
}

module.exports = SpellCheck
