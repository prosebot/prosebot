const { Application } = require('probot')
const appFn = require('..')

const payload = require('./fixtures/check_suite.requested.json')

describe('write-good-app', () => {
  let app, github, event

  beforeEach(() => {
    github = {
      pullRequests: {
        getFiles: jest.fn(() => Promise.resolve({ data: [
          { filename: 'added.md', status: 'added' },
          { filename: 'modified.md', status: 'modified' },
          { filename: 'deleted.md', status: 'deleted' }
        ] }))
      },
      repos: {
        getContent: jest.fn(() => Promise.resolve({ data: {
          content: Buffer.from('This here is some content!', 'utf8').toString('base64')
        }}))
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

  it('creates a `success` check run', async () => {
    await app.receive(event)
    expect(github.checks.create).toHaveBeenCalled()

    const call = github.checks.create.mock.calls[0][0]
    expect(call.conclusion).toBe('success')

    delete call.completed_at
    expect(call).toMatchSnapshot()
  })

  it('creates a `failing` check run', async () => {
    github.repos.getContent.mockReturnValueOnce(Promise.resolve({ data: {
      content: Buffer.from('So this is a cat.', 'utf8').toString('base64')
    } }))
    await app.receive(event)
    expect(github.checks.create).toHaveBeenCalled()

    const call = github.checks.create.mock.calls[0][0]
    expect(call.conclusion).toBe('failure')

    delete call.completed_at
    expect(call).toMatchSnapshot()
  })
})
