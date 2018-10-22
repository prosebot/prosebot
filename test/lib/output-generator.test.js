const OutputGenerator = require('../../lib/output-generator')

describe('OutputGenerator', () => {
  let map, generator

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

    generator = new OutputGenerator(map)
  })

  describe('#removeMarkdownFromFiles', () => {
    it('removes markdown from the files and returns the expected map', () => {
      const actual = generator.removeMarkdownFromFiles()
      expect(actual).toMatchSnapshot()
    })
  })

  describe('#buildWriteGoodResults', () => {
    it('returns the expected result', () => {
      const noMd = generator.removeMarkdownFromFiles()
      const actual = generator.buildWriteGoodResults(noMd)
      expect(actual).toMatchSnapshot()
    })
  })

  describe('#reachConclusion', () => {
    it('returns `failure` if there are any suggestions', () => {
      const noMd = generator.removeMarkdownFromFiles()
      const results = generator.buildWriteGoodResults(noMd)
      const actual = generator.reachConclusion(results)
      expect(actual).toBe('failure')
    })

    it('returns `success` if there are no suggestions', () => {
      const actual = generator.reachConclusion(new Map())
      expect(actual).toBe('success')
    })
  })

  describe('#buildSummary', () => {
    it('returns the expected result if the conclusion is `success`', () => {
      const actual = generator.buildSummary('success')
      expect(actual).toBe('No issues have been found, great job!')
    })

    it('returns the expected string if there are suggestions', () => {
      const noMd = generator.removeMarkdownFromFiles()
      const results = generator.buildWriteGoodResults(noMd)
      const actual = generator.buildSummary('failure', results)
      expect(actual).toMatchSnapshot()
    })
  })

  describe('#buildAnnotations', () => {
    it('returns the expected array of annotations', () => {
      const noMd = generator.removeMarkdownFromFiles()
      const results = generator.buildWriteGoodResults(noMd)
      const actual = generator.buildAnnotations(noMd, results)
      expect(actual).toMatchSnapshot()
    })
  })

  describe('#generate', () => {
    it('generates the expected result', () => {
      const actual = generator.generate()
      expect(actual).toMatchSnapshot()
    })
  })
})
