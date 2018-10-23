const SpellCheck = require('../../../lib/providers/spellcheck')

describe('SpellCheck provider', () => {
  let provider

  beforeEach(() => {
    const map = new Map()

    const obj = {
      'filename.md': 'iam not a wurd',
      'anotherfile.md': 'Tenis is a fun sporq',
      'gibberish.md': 'Absdfsdalkjhfthjsdfsdf'
    }

    for (const key in obj) {
      map.set(key, obj[key])
    }

    provider = new SpellCheck(map)
  })

  describe('#buildResults', () => {
    it('returns the expected result', () => {
      const actual = provider.buildResults()
      expect(actual).toMatchSnapshot()
    })
  })
})
