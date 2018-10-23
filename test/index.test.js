const { Application } = require('probot')
const appFn = require('..')

const payload = require('./fixtures/check_suite.requested.json')

const badText = `## Hello! How are you?

This is dope. So this is a cat.

So is this is so a cat!

We have confirmed his identity.
`

describe('prosebot', () => {
  let app, github, event

  beforeEach(() => {
    github = {
      pullRequests: {
        getFiles: jest.fn(() => Promise.resolve({ data: [
          { filename: 'added.md', status: 'added' },
          { filename: 'modified.md', status: 'modified' },
          { filename: 'deleted.md', status: 'deleted' },
          { filename: 'deleted.not-md', status: 'added' }
        ] }))
      },
      repos: {
        getContent: jest.fn(o => {
          if (o.path === '.github/write-good.yml') throw { code: 404 } // eslint-disable-line no-throw-literal
          return Promise.resolve({ data: {
            content: Buffer.from('This here is some content!', 'utf8').toString('base64')
          }})
        })
      },
      checks: {
        create: jest.fn()
      }
    }

    app = new Application()
    app.load(appFn)
    app.auth = () => Promise.resolve(github)

    event = { name: 'check_suite', payload }
  })

  it('does not create a check run if there is no PR', async () => {
    await app.receive({
      name: event.name,
      payload: {
        action: payload.action,
        check_suite: {
          pull_requests: []
        }
      }
    })
    expect(github.checks.create).not.toHaveBeenCalled()
  })

  it('creates a `neutral` check run if there are no files to check', async () => {
    github.pullRequests.getFiles.mockReturnValueOnce(Promise.resolve({ data: [] }))
    await app.receive(event)
    expect(github.checks.create).toHaveBeenCalled()

    const call = github.checks.create.mock.calls[0][0]
    expect(call.conclusion).toBe('neutral')

    delete call.completed_at
    expect(call).toMatchSnapshot()
  })

  it('creates a `success` check run', async () => {
    await app.receive(event)
    expect(github.checks.create).toHaveBeenCalled()

    const call = github.checks.create.mock.calls[0][0]
    expect(call.conclusion).toBe('success')

    delete call.completed_at
    expect(call).toMatchSnapshot()
  })

  it('creates a `failing` check run', async () => {
    github.repos.getContent = jest.fn(o => {
      if (o.path === '.github/write-good.yml') throw { code: 404 } // eslint-disable-line no-throw-literal
      return Promise.resolve({ data: {
        content: Buffer.from(badText, 'utf8').toString('base64')
      } })
    })

    await app.receive(event)
    expect(github.checks.create).toHaveBeenCalled()

    const call = github.checks.create.mock.calls[0][0]
    expect(call.conclusion).toBe('failure')

    delete call.completed_at
    expect(call).toMatchSnapshot()
  })
})
