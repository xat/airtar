#!/usr/bin/env node

var opts = require('minimist')(process.argv.slice(2), { boolean: 'overwrite' })
var utils = require('./utils')
var log = require('single-line-log').stdout
var measure = utils.measureThroughput()
var prettysize = require('prettysize')
var airpaste = require('airpaste')
var tarfs = require('tar-fs')
var fs = require('fs')
var stream

if (opts.help || !opts._.length) {
  console.log('Usage: airuntar [--namespace <name>] [--overwrite] <target>')
  process.exit()
}

stream = airpaste(opts.namespace)

var ignore = function (name) {
  if (!opts.overwrite && fs.existsSync(name) && fs.statSync(name).isFile()) {
    console.log('file already exists: ' + name)
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
