#!/usr/bin/env node

var opts = require('minimist')(process.argv.slice(2))
var stream = require('airpaste')(opts.namespace || 'global')
var spawn = require('child_process').spawn
var target = opts._.length ? opts._[0] : '.'
var utils = require('./utils')
var log = require('single-line-log').stdout
var measure = utils.measureThroughput()
var prettysize = require('prettysize')

if (opts.help) {
  return console.log('Usage: airuntar [--namespace <name>] [<target>]')
}

stream.pipe(measure.getStream()).pipe(spawn('tar', ['x', '-C', target]).stdin)

log('waiting for sender...\n')

var inter = setInterval(function () {
  if (measure.getThroughput()) {
    log(prettysize(measure.getThroughput()) + ' / sec\n')
  }
}, 500);

stream.on('end', function() {
  clearInterval(inter)
  log(prettysize(measure.getTransfered()) + ' received\n')
})
