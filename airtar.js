#!/usr/bin/env node

var opts = require('minimist')(process.argv.slice(2))
var stream = require('airpaste')(opts.namespace)
var spawn = require('child_process').spawn
var source = opts._.length ? opts._ : ['.']
var utils = require('./utils')
var log = require('single-line-log').stdout
var measure = utils.measureThroughput()
var prettysize = require('prettysize')

if (opts.help) {
  console.log('Usage: airtar [--namespace <name>] [<source>, <source>, ...]')
  process.exit()
}

spawn('tar', ['c'].concat(source)).stdout.pipe(measure.getStream()).pipe(stream)

log('waiting for receiver...\n')

var inter = setInterval(function () {
  if (measure.getThroughput()) {
    log(prettysize(measure.getThroughput()) + ' / sec\n')
  }
}, 500);

stream.on('finish', function() {
  clearInterval(inter)
  log(prettysize(measure.getTransfered()) + ' transfered\n')
})
