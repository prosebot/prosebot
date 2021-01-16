const SpellCheck = require('../../../lib/providers/spellcheck')

describe('SpellCheck provider', () => {
  let provider

  beforeEach(() => {
    const map = new Map()

    const obj = {
      'filename.md': 'iam not a wurd',
      'anotherfile.md': 'Tenis is a fun sporq',
      'gibberish.md': 'AbsdfsdalkjhfthjsdfsdfAbsdfsdalkjhfthjsdfsdfAbsdfs',
      'technical-doc.md':
        'This is a `config.yml` file. Here is some code: ```js\nconsole.log(pizza_slice)\n```',
    }

    for (const key in obj) {
      map.set(key, obj[key])
    }

    provider = new SpellCheck(map)
    provider.suggestCorrections = jest.fn(() =>
      Promise.resolve(['correctly', 'spelled', 'words'])
    )
  })

  describe('#buildReasonString', () => {
    it('returns the expected string with zero possible corrections', async () => {
      provider.suggestCorrections.mockImplementation(() => Promise.resolve([]))

      const actual = await provider.buildResults()

      expect(actual.get('filename.md')).toMatchSnapshot()
    })

    it('returns the expected string with some corrections', async () => {
      const actual = await provider.buildResults()

      expect(actual.get('filename.md')).toMatchSnapshot()
    })
  })

  describe('#buildResults', () => {
    it('creates the file map with appropriate reasons', async () => {
      const actual = await provider.buildResults()

      expect(actual).toMatchSnapshot()
    })
  })
})
