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

  it('creates a check run', async () => {
    await app.receive(event)
    expect(github.checks.create).toHaveBeenCalled()
  })
})
