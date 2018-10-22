/**
 * This is the entry point for your Probot App.
 * @param {import('probot').Application} app - Probot's Application class.
 */
module.exports = app => {
  app.on('check_suite.requested', async context => {
    // 1. Get list of new or modified files ending in .md, .txt
    // 2. Get content of each of those files
    // 3. For each:
    //   1. Remove markdown
    //   2. Run through `write-good`
    //   3. Construct Checks response output
    // return context.github.checks.create({})
  })
}
