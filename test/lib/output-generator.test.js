const OutputGenerator = require('../../lib/output-generator')
const defaultConfig = require('../../lib/default-config')

describe('OutputGenerator', () => {
  let map, generator, logger

  beforeEach(() => {
    logger = {
      debug: jest.fn(),
      info: jest.fn()
    }

    map = new Map()
    const obj = {
      'filename.md': '# This is some text',
      'anotherfile.md': 'this **Has** some Problems. it sure does Jason?',
      'cats.md': 'So the cat was stolen.'
    }

    for (const key in obj) {
      map.set(key, obj[key])
    }

    generator = new OutputGenerator(map, defaultConfig, logger)
  })

  describe('static#removeMarkdownFromFiles', () => {
    it('removes markdown from the files and returns the expected map', () => {
      const actual = OutputGenerator.removeMarkdownFromFiles(map)
      expect(actual).toMatchSnapshot()
    })
  })

  describe('#reachConclusion', () => {
    it('returns `failure` if there are any suggestions', () => {
      const results = generator.buildAllResults()
      const actual = generator.reachConclusion(results)
      expect(actual).toBe('failure')
    })

    it('returns `success` if there are no suggestions', () => {
      const actual = generator.reachConclusion(new Map())
      expect(actual).toBe('success')
    })

    it('returns `success` if there are no suggestions in a real map', () => {
      const newerMap = new Map()
      newerMap.set('filename.md', [])
      const actual = generator.reachConclusion(newerMap)
      expect(actual).toBe('success')
    })
  })

  describe('#buildSummary', () => {
    it('returns the expected result if the conclusion is `success`', () => {
      const actual = generator.buildSummary('success')
      expect(actual).toBe('No issues have been found, great job!')
    })

    it('returns the expected string if there are suggestions', () => {
      const results = generator.buildAllResults()
      const actual = generator.buildSummary('failure', results)
      expect(actual).toMatchSnapshot()
    })

    it('returns the expected string if there is just one', () => {
      const results = new Map()
      results.set('filename.md', [{ line: 1, reason: 'why not' }])
      const actual = generator.buildSummary('failure', results)
      expect(actual).toMatchSnapshot()
    })

    it('returns the expected string with zero results', () => {
      const results = new Map()
      results.set('filename.md', [])
      const actual = generator.buildSummary('failure', results)
      expect(actual).toMatchSnapshot()
    })
  })

  describe('#buildAnnotations', () => {
    it('returns the expected array of annotations', () => {
      const results = generator.buildAllResults()
      const actual = generator.buildAnnotations(results)
      expect(actual).toMatchSnapshot()
    })
  })

  describe('#generate', () => {
    it('generates the expected result', () => {
      const actual = generator.generate()
      expect(actual).toMatchSnapshot()
    })

    it('only uses the enabled providers', () => {
      generator.config = { ...generator.config, writeGood: false }
      const actual = generator.generate()
      expect(actual).toMatchSnapshot()
    })
  })
})
