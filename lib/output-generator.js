const removeMarkdown = require("remove-markdown");
const providers = require("./providers");

/**
 * @class
 */
class OutputGenerator {
  /**
   * @constructor
   * @param {Map<string, string>} map - filename => file contents
   * @param {object} config
   */
  constructor(map, config, logger) {
    this.map = map;
    this.config = config;
    this.logger = logger;
  }

  /**
   * Remove markdown from the files of the provided Map
   * @returns {Map<string, string>}
   */
  static removeMarkdownFromFiles(map) {
    const markdownStripped = new Map();

    for (const [filename, contents] of map) {
      markdownStripped.set(filename, removeMarkdown(contents));
    }

    return markdownStripped;
  }

  /**
   * Returns `success` or `failure` if the result of the writeGood check has suggestions
   * @param {Map<string, Result[]>} results
   * @returns {string} - Either `success` or `failure`
   */
  reachConclusion(results) {
    let conclusion = "success";

    for (const [, reasons] of results) {
      if (reasons.length) {
        if (reasons.some((r) => r.annotation_level === "failure")) {
          conclusion = "failure";
          break;
        } else {
          conclusion = "neutral";
        }
      }
    }

    this.conclusion = conclusion;
    return conclusion;
  }

  /**
   * Builds the summary of the check run
   * @param {string} conclusion - Either `success` or `failure`
   * @param {Map<string, Result[]>} results
   * @returns {string}
   */
  buildSummary(conclusion, results) {
    if (conclusion === "success")
      return "No issues have been found, great job!";

    let numFiles = 0;
    let numSuggestions = 0;

    for (const result of results) {
      const suggestions = result[1];
      if (suggestions.length) {
        numFiles++;
        numSuggestions += suggestions.length;
      }
    }

    // Is this number plural?
    const s = (num) => (num === 1 ? "" : "s");
    return `**${numSuggestions} suggestion${s(numSuggestions)}** ${
      numSuggestions === 1 ? "has" : "have"
    } been found in **${numFiles} file${s(numFiles)}**.`;
  }

  /**
   * Builds the annotations to go with a failing conclusion
   * @param {Map<string, string>} contentMap
   * @param {Map<string, Result[]>} resultsMap
   * @returns {Annotation[]}
   */
  buildAnnotations(resultsMap) {
    const annotations = [];
    for (const [filename, results] of resultsMap) {
      if (!results.length) continue;

      results.forEach((result) => {
        annotations.push({
          path: filename,
          start_line: result.line,
          end_line: result.line,
          annotation_level: result.annotation_level || "warning",
          message: result.reason,
        });
      });
    }

    return annotations;
  }

  /**
   * Gets the results of all the enabled providers
   * @returns {Map<string, Result[]>}
   */
  buildAllResults(context) {
    // Just the providers that have been enabled, as per the repo's config file
    const enabledProviders = Object.keys(providers).filter((key) =>
      Boolean(this.config[key])
    );

    return Promise.all(
      enabledProviders.map(async (key) => {
        const Provider = providers[key];
        const provider = new Provider(this.map);

        // Build the results from the given provider
        const results = provider.buildResults();
        this.logger.debug(key, results);

        const conclusion = this.reachConclusion(results);
        const summary = this.buildSummary(conclusion, results);

        // Let em know whats up by creating a Check Run
        return context.octokit.checks.create(
          context.repo({
            name: provider.constructor.name,
            head_sha: context.payload.check_suite.head_sha,
            head_branch: context.payload.check_suite.head_branch,
            completed_at: new Date().toISOString(),
            conclusion,
            output: {
              title:
                conclusion === "success"
                  ? "No issues have been found!"
                  : `${provider.constructor.name} has some suggestions!`,
              summary,
              annotations: this.buildAnnotations(results),
            },
          })
        );
      })
    );
  }
}

module.exports = OutputGenerator;

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

/**
 * @typedef {Object} Result
 * @prop {string} reason
 * @prop {number} line
 * @prop {string} [annotation_level]
 */
