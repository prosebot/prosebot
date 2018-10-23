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

      // Spellcheck bounces the corrections around, so we can't snapshot test
      expect(actual.size).toBe(3)

      // Ensure we include a corrections string
      expect(actual.get('filename.md').some(a => a.reason.includes('How about:'))).toBe(true)
      expect(actual.get('anotherfile.md').some(a => a.reason.includes('How about:'))).toBe(true)

      // Gibberish one, shouldn't include any corrections
      expect(actual.get('gibberish.md').some(a => a.reason.includes('How about:'))).toBe(false)
    })
  })
})
