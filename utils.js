var through2 = require('through2')

var measureThroughput = function () {
  var transfered = 0
  var throughput = 0
  var min = 1000000 // 1 mb
  var startTime

  var stream = through2(function (chunk, enc, next) {
    transfered += chunk.length
    this.push(chunk)

    if (!startTime && transfered > min) {
      startTime = Date.now()
    }

    if (transfered > min) {
      throughput = transfered / ((Date.now() - startTime) / 1000)
    }

    next()
  })

  return {
    getStream: function () {
      return stream
    },
    getTransfered: function () {
      return transfered
    },
    getThroughput: function () {
      return throughput
    }
  }
}

module.exports = {
  measureThroughput: measureThroughput
}
