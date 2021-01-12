const Alex = require('../../../lib/providers/alex')

describe('Alex provider', () => {
  let provider

  beforeEach(() => {
    const map = new Map()

    const obj = {
      'guys.md': 'Hey guys how are you',
      'he.md': 'He walked to class.',
    }

    for (const key in obj) {
      map.set(key, obj[key])
    }

    provider = new Alex(map)
  })

  describe('#buildResults', () => {
    it('returns the expected result', () => {
      const actual = provider.buildResults()

      expect(actual).toMatchSnapshot()
    })
  })

  describe('#serializeResults', () => {
    it('returns a failing annotation_level if the result is `fatal: true`', () => {
      const actual = provider.serializeReasons([
        {
          line: 1,
          message: 'Hi!',
          fatal: true,
        },
      ])

      expect(actual).toEqual([
        {
          line: 1,
          reason: 'Hi!',
          annotation_level: 'failing',
        },
      ])
    })
  })
})
