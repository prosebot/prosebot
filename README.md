<h1 align="center">🗣✅</h1>
<h3 align="center">Word Good</h3>
<p align="center"><a href="https://probot.github.io">Probot App</a> to help you write better on GitHub.<p>
<p align="center"><a href="https://travis-ci.com/JasonEtco/write-good-app"><img src="https://badgen.net/travis/JasonEtco/write-good-app" alt="Build Status"></a> <a href="https://codecov.io/gh/JasonEtco/write-good-app/"><img src="https://badgen.net/codecov/c/github/JasonEtco/write-good-app" alt="Codecov"></a></p>

## Usage

This Probot App listens for changes to Markdown files (`.md`) or text files (`.txt`) and runs various checks against them to provide feedback on the English. Currently, the app checks for spelling, prose and inclusive verbiage.

### Installation

~Visit [the installation page](https://github.com/apps/write-good-app) and install the GitHub App on your repositories.~ COMING :soon:

### Configuration

There are currently three providers that the app uses to test your text. These can each be disabled, and are all enabled by default. To disable a provider, add a `.github/write-good.yml` file to your repository and set the provider to `false`:

```yaml
# .github/write-good.yml
writeGood: true
alex: true
spellchecker: true
```

### Credits

This Probot App is mostly a wrapper around existing open source libraries. The majority of the work is done by those, and they deserve a ton of thanks:

* [`write-good`](https://github.com/btford/write-good)
* [`alex`](https://github.com/get-alex/alex)
* [`node-spellchecker`](https://github.com/atom/node-spellchecker)
