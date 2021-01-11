const OutputGenerator = require("./lib/output-generator");
const defaultConfig = require("./lib/default-config");

/**
 * This is the entry point for your Probot App.
 * @param app - Probot's Application class.
 */
module.exports = (app) => {
  app.on(
    // ["pull_request.opened, pull_request.reopened", "pull_request.edited"],
    "pull_request",
    async function prosebot(context) {
      const { pull_request: pr, repository } = context.payload;
      if (!pr) return;

      // Get the files in the PR
      const { data: files } = await context.octokit.request(
        `GET /repos/${repository.full_name}/pulls/${pr.number}/files`,
        {
          owner: repository.owner.login,
          repo: repository.name,
          pull_number: pr.number,
        }
      );

      // We only care about .md and .txt files that have been changed or added
      const filesWeCareAbout = files.filter((file) => {
        const rightFormat =
          file.filename.endsWith(".md") || file.filename.endsWith(".txt");
        const rightStatus =
          file.status === "added" || file.status === "modified";
        return rightFormat && rightStatus;
      });

      if (filesWeCareAbout.length === 0) {
        // No markdown files or txt files - give 'em a neutral message.
        return context.octokit.checks.create(
          context.repo({
            name: "prosebot",
            head_sha: pr.head_sha,
            head_branch: pr.head_branch,
            completed_at: new Date().toISOString(),
            conclusion: "neutral",
            output: {
              title: "No relevant files",
              summary:
                "There were no `.md` or `.txt` files that needed checking.",
            },
          })
        );
      }

      // Get the repo's config file
      let config = await context.config("prosebot.yml");
      if (Object.keys(config).length === 0) {
        config = defaultConfig;
      }

      // Prepare a map of files, filename => contents
      const fileMap = new Map();
      await Promise.all(
        filesWeCareAbout.map(async (file) => {
          const contents = await context.octokit.repos.getContent(
            context.repo({
              path: file.filename,
              ref: pr.head_branch,
            })
          );

          fileMap.set(file.filename, contents.data);
        })
      );
      context.log.debug("Filemap", fileMap);

      // Create the generator instance
      const generator = new OutputGenerator(fileMap, config, context.log);

      // Generate the output
      return generator.buildAllResults(context);
    }
  );
};
