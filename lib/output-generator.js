const removeMarkdown = require('remove-markdown')
const providers = require('./providers')

/**
 * @class
 */
class OutputGenerator {
  /**
   * @constructor
   * @param {Map<string, string>} map - filename => file contents
   * @param {object} config
   */
  constructor (map, config) {
    this.map = map
    this.config = config
  }

  /**
   * Remove markdown from the files of the provided Map
   * @returns {Map<string, string>}
   */
  static removeMarkdownFromFiles (map) {
    const markdownStripped = new Map()

    for (const [filename, contents] of map) {
      markdownStripped.set(filename, removeMarkdown(contents))
    }

    return markdownStripped
  }

  /**
   * Returns `success` or `failure` if the result of the writeGood check has suggestions
   * @param {Map<string, object[]>} writeGoodOutput
   * @returns {string}
   */
  reachConclusion (writeGoodOutput) {
    let success = true

    for (const output of writeGoodOutput) {
      if (output[1].length) {
        success = false
        break
      }
    }

    const conclusion = success ? 'success' : 'failure'
    this.conclusion = conclusion
    return conclusion
  }

  /**
   * Builds the summary of the check run
   * @param {string} conclusion - Either `success` or `failure`
   * @param {Map<string, object[]>} writeGoodResults
   * @returns {string}
   */
  buildSummary (conclusion, writeGoodResults) {
    if (conclusion === 'success') return 'No issues have been found, great job!'

    let numFiles = 0
    let numSuggestions = 0

    for (const result of writeGoodResults) {
      const suggestions = result[1]
      if (suggestions.length) {
        numFiles++
        numSuggestions += suggestions.length
      }
    }

    // Is this number plural?
    const s = num => num === 1 ? '' : 's'
    return `**${numSuggestions} suggestion${s(numSuggestions)}** ${numSuggestions === 1 ? 'has' : 'have'} been found in **${numFiles} file${s(numFiles)}**.`
  }

  /**
   * Builds the annotations to go with a failing conclusion
   * @param {Map<string, string>} contentMap
   * @param {Map<string, object[]>} resultsMap
   * @returns {Annotation[]}
   */
  buildAnnotations (resultsMap) {
    const annotations = []
    for (const [filename, results] of resultsMap) {
      if (!results.length) continue

      results.forEach(result => {
        annotations.push({
          path: filename,
          start_line: result.line,
          end_line: result.line,
          annotation_level: result.annotation_level || 'warning',
          message: result.reason
        })
      })
    }

    return annotations
  }

  buildAllResults () {
    const fullMap = new Map()
    const keys = Object.keys(providers)
    const enabledProviders = keys.filter(key => Boolean(this.config[key]))

    enabledProviders.forEach(key => {
      const Provider = providers[key]
      const provider = new Provider(this.map)
      const results = provider.buildResults()

      for (const [filename, reasons] of results) {
        if (!reasons.length) continue
        if (fullMap.has(filename)) {
          const existing = fullMap.get(filename)
          fullMap.set(filename, [...reasons, existing])
        } else {
          fullMap.set(filename, reasons)
        }
      }
    })

    return fullMap
  }

  /**
   * @returns {OutputReturn}
   */
  generate () {
    const results = this.buildAllResults()
    const conclusion = this.reachConclusion(results)
    const summary = this.buildSummary(conclusion, results)

    return {
      title: conclusion === 'success' ? 'No issues have been found!' : 'See suggestions below.',
      summary,
      annotations: this.buildAnnotations(results)
    }
  }
}

module.exports = OutputGenerator

/**
 * @typedef {Object} OutputReturn
 * @prop {string} title
 * @prop {string} summary
 * @prop {string} conclusion - success, failure, neutral, cancelled, timed_out or action_required
 * @prop {Annotation[]} [annotations]
 */

/**
 * @typedef {Object} Annotation
 * @prop {string} path
 * @prop {number} start_line
 * @prop {number} end_line
 * @prop {number} [start_column]
 * @prop {number} [end_column]
 * @prop {string} annotation_level - One of notice, warning or failure
 * @prop {string} message
 * @prop {string} title
 * @prop {string} raw_details
 */
