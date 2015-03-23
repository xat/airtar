#!/usr/bin/env node

var opts = require('minimist')(process.argv.slice(2))
var utils = require('./utils')
var log = require('single-line-log').stdout
var measure = utils.measureThroughput()
var prettysize = require('prettysize')
var airpaste = require('airpaste')
var isAbsolute = require('absolute-path')
var tarfs = require('tar-fs')
var stream

if (opts.help || !opts._.length) {
  console.log('Usage: airuntar [--namespace <name>] <target>')
  process.exit()
}

stream = airpaste(opts.namespace)

var ignore = function (name) {
  if (isAbsolute(name)) {
    console.log('ignoring absolute path: ' + name)
    return true
  }
  return false
}

stream.pipe(measure.getStream()).pipe(tarfs.extract(opts._[0], { ignore: ignore }))

log('waiting for sender...\n')

var inter = setInterval(function () {
  if (measure.getThroughput()) {
    log(prettysize(measure.getThroughput()) + ' / sec\n')
  }
}, 500)

stream.on('end', function () {
  clearInterval(inter)
  log(prettysize(measure.getTransfered()) + ' received\n')
})
