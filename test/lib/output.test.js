const Output = require('../../lib/output')

describe('output', () => {
  let map, output

  beforeEach(() => {
    map = new Map()
    const obj = {
      'filename.md': '# This is some text',
      'anotherfile.md': 'this **Has** some Problems. it sure does jason?',
      'cats.md': 'So the cat was stolen.'
    }

    for (const key in obj) {
      map.set(key, obj[key])
    }

    output = new Output(map)
  })

  describe('#removeMarkdownFromFiles', () => {
    it('removes markdown from the files and returns the expected map', () => {
      const actual = output.removeMarkdownFromFiles()
      expect(actual).toMatchSnapshot()
    })
  })

  describe('#buildWriteGoodResults', () => {
    it('returns the expected result', () => {
      const noMd = output.removeMarkdownFromFiles()
      const actual = output.buildWriteGoodResults(noMd)
      expect(actual).toMatchSnapshot()
    })
  })

  describe('#reachConclusion', () => {
    it('returns `failure` if there are any suggestions', () => {
      const noMd = output.removeMarkdownFromFiles()
      const results = output.buildWriteGoodResults(noMd)
      const actual = output.reachConclusion(results)
      expect(actual).toBe('failure')
    })

    it('returns `success` if there are no suggestions', () => {
      const actual = output.reachConclusion(new Map())
      expect(actual).toBe('success')
    })
  })

  describe('#buildSummary', () => {
    it('returns the expected result if the conclusion is `success`', () => {
      const actual = output.buildSummary('success')
      expect(actual).toBe('No issues have been found, great job!')
    })

    it('returns the expected string if there are suggestions', () => {
      const noMd = output.removeMarkdownFromFiles()
      const results = output.buildWriteGoodResults(noMd)
      const actual = output.buildSummary('failure', results)
      expect(actual).toMatchSnapshot()
    })
  })

  describe('#buildAnnotations', () => {
    it('returns the expected array of annotations', () => {
      const noMd = output.removeMarkdownFromFiles()
      const results = output.buildWriteGoodResults(noMd)
      const actual = output.buildAnnotations(noMd, results)
      expect(actual).toMatchSnapshot()
    })
  })
})
