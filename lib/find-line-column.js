module.exports = function findLineColumn (contents, index) {
  const lines = contents.split('\n')
  var line = contents.substr(0, index).split('\n').length

  var startOfLineIndex = (function () {
    var x = lines.slice(0)
    x.splice(line - 1)
    return x.join('\n').length + (x.length > 0)
  }())

  var col = index - startOfLineIndex

  return {
    line: line,
    col: col
  }
}
