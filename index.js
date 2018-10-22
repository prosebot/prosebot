const OutputGenerator = require('./lib/output-generator')

/**
 * This is the entry point for your Probot App.
 * @param {import('probot').Application} app - Probot's Application class.
 */
module.exports = app => {
  app.on('check_suite.requested', async context => {
    // Only act on one pull request (for now)
    const pr = context.payload.check_suite.pull_requests[0]
    if (!pr) return

    // Get the files in the PR
    const { data: files } = await context.github.pullRequests.getFiles(context.repo({
      number: pr.number,
      per_page: 100
    }))

    // We only care about .md and .txt files that have been changed or added
    const filesWeCareAbout = files.filter(file => {
      const rightFormat = file.filename.endsWith('.md') || file.filename.endsWith('.txt')
      const rightStatus = file.status === 'added' || file.status === 'modified'
      return rightFormat && rightStatus
    })

    // Prepare a map of files, filename => contents
    const fileMap = new Map()
    await Promise.all(filesWeCareAbout.map(async file => {
      const contents = await context.github.repos.getContent(context.repo({
        path: file.filename,
        ref: context.payload.check_suite.head_branch
      }))

      fileMap.set(file.filename, contents)
    }))

    // Create the generator instance
    const generator = new OutputGenerator(fileMap)

    // Generate the output
    const output = generator.generate()

    // Let em know whats up by creating a Check Run
    return context.github.checks.create(context.repo({
      name: 'write-good-app',
      head_sha: context.github.check_suite.head_sha,
      head_branch: context.payload.check_suite.head_branch,
      completed_at: new Date().toISOString(),
      conclusion: generator.conclusion,
      output
    }))
  })
}
