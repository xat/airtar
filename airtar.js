#!/usr/bin/env node

var opts = require('minimist')(process.argv.slice(2))
var utils = require('./utils')
var log = require('single-line-log').stdout
var measure = utils.measureThroughput()
var prettysize = require('prettysize')
var isAbsolute = require('absolute-path')
var airpaste = require('airpaste')
var tarfs = require('tar-fs')
var glob = require('glob')
var cwd = process.cwd()
var stream
var source

if (opts.help || !opts._.length) {
  console.log('Usage: airtar [--namespace <name>] <source> [<source>, ...]')
  process.exit()
}

source = opts._.reduce(function (memo, entry) {
  return memo.concat(glob.sync(entry))
}, [])

if (source.filter(isAbsolute).length) {
  console.warn('Absolute paths are not allowed.')
  process.exit()
}

stream = airpaste(opts.namespace)

tarfs.pack(cwd, { entries: source }).pipe(measure.getStream()).pipe(stream)

log('waiting for receiver...\n')

var inter = setInterval(function () {
  if (measure.getThroughput()) {
    log(prettysize(measure.getThroughput()) + ' / sec\n')
  }
}, 500)

stream.on('finish', function () {
  clearInterval(inter)
  log(prettysize(measure.getTransfered()) + ' transfered\n')
})
