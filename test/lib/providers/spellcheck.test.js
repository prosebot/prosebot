const SpellCheck = require('../../../lib/providers/spellcheck')

describe('SpellCheck provider', () => {
  let provider

  beforeEach(() => {
    const map = new Map()

    const obj = {
      'filename.md': 'iam not a wurd',
      'anotherfile.md': 'Tenis is a fun sporq',
      'gibberish.md': 'AbsdfsdalkjhfthjsdfsdfAbsdfsdalkjhfthjsdfsdfAbsdfsdalkjhfthjsdfsdfAbsdfsdalkjhfthjsdfsdfAbsdfsdalkjhfthjsdfsdf',
      'technical-doc.md': 'This is a `config.yml` file. Here is some code: ```js\nconsole.log(pizza_slice)\n```'
    }

    for (const key in obj) {
      map.set(key, obj[key])
    }

    provider = new SpellCheck(map)

    // Don't return any corrections, these can change depending on
    // the environment so snapshots will always fail.
    provider.spellchecker.getCorrectionsForMisspelling = jest.fn(() => ([]))
  })

  describe('#buildResults', () => {
    it('returns the expected result', () => {
      const actual = provider.buildResults()
      expect(actual).toMatchSnapshot()
    })
  })

  describe('#buildReasonString', () => {
    it('returns the expected string with zero possible corrections', () => {
      provider.spellchecker.getCorrectionsForMisspelling = jest.fn(() => ([]))
      const actual = provider.buildResults()
      expect(actual.get('filename.md')).toMatchSnapshot()
    })
  })
})
