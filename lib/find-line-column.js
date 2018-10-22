module.exports = function findLineColumn (contents, index) {
  const lines = contents.split('\n')
  const line = contents.substr(0, index).split('\n').length

  const startOfLineIndex = (function () {
    const x = lines.slice(0)
    x.splice(line - 1)
    return x.join('\n').length + (x.length > 0)
  }())

  const col = index - startOfLineIndex

  return {
    line: line,
    col: col
  }
}
