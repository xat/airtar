#!/usr/bin/env node

var minimist = require('minimist')
var log = require('single-line-log').stdout
var prettysize = require('prettysize')
var isAbsolute = require('absolute-path')
var progress = require('progress-stream')
var through = require('through2')
var circulate = require('array-loop')
var airpaste = require('airpaste')
var tarfs = require('tar-fs')
var fs = require('fs')
var glob = require('glob')
var chalk = require('chalk')
var cwd = process.cwd()
var dots = circulate(['.', '..', '...', '...'])

var opts = minimist(process.argv.slice(2), {
  boolean: ['r', 'o']
})

if (opts.help || !opts._.length) {
  console.log([
    '',
    'Usage',
    '  Send    : airtar [-n <name>] <source> [<source>, ...]',
    '  Receive : airtar -r [-n <name>] [-o] <target>',
    '',
    'Option     Meaning',
    '-r         receive a file',
    '-n <name>  define a namespace',
    '-o         overwrite existing files',
    ''
  ].join('\n'))
  process.exit()
}

var measure = function (fileStream, header) {
  var prog = progress({
    length: header.size,
    time: 200
  })

  prog.on('progress', function (info) {
    var str = ' ' + header.name + ' ' + chalk.gray('(' + prettysize(header.size) + ')')
    if (info.percentage === 100) {
      log('')
      console.log(chalk.green('[ DONE ]') + str)
    } else {
      log(chalk.gray('[ ' + info.percentage.toFixed(0) + ' % ] ') + str + '\n')
    }
  })

  return fileStream.pipe(prog)
}

var counter = function () {
  var total = 0
  return {
    through: through(function (chunk, enc, next) {
      total += chunk.length
      this.push(chunk)
      next()
    }),
    total: function () {
      return total
    }
  }
}

var wait = function (msg) {
  var inter = setInterval(function () {
    log(msg + dots())
  }, 300)
  return function () {
    log('')
    clearInterval(inter)
  }
}

var send = function () {
  var source = opts._.reduce(function (memo, entry) {
    return memo.concat(glob.sync(entry))
  }, [])

  if (source.filter(isAbsolute).length) {
    console.log(chalk.red('Absolute paths are not allowed.'))
    process.exit()
  }

  var stream = airpaste(opts.namespace)
  var found = wait('waiting for receiver')
  var count = counter()

  stream.once('uncork', function () {
    found()
    tarfs
      .pack(cwd, { entries: source, mapStream: measure })
      .pipe(count.through)
      .pipe(stream)
  })

  stream.once('finish', function () {
    console.log(chalk.gray(prettysize(count.total()) + ' sent'))
  })
}

var receive = function () {
  var stream = airpaste(opts.namespace)

  var ignore = function (name) {
    if (!opts.o && fs.existsSync(name) && fs.statSync(name).isFile()) {
      console.log(chalk.red('[ EXISTS ]') + ' ' + name)
      return true
    }
    return false
  }

  var found = wait('waiting for sender')
  var count = counter()
  var target = tarfs.extract(opts._[0], { ignore: ignore, mapStream: measure })

  stream.once('uncork', function () {
    found()
    stream
      .pipe(count.through)
      .pipe(target)
  })

  target.once('finish', function () {
    console.log(chalk.gray(prettysize(count.total()) + ' received'))
  })
}

process.on('uncaughtException', function () {
  log('')
  console.log(chalk.red('oooops, something went wrong'))
})

if (!opts.r) {
  send()
} else {
  receive()
}
