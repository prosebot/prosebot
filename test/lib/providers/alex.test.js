const Alex = require('../../../lib/providers/alex')

describe('Alex provider', () => {
  let provider

  beforeEach(() => {
    const map = new Map()

    const obj = {
      'guys.md': 'Hey guys how are you',
      'he.md': 'He walked to class.'
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
})
