'use strict'

const build = require('pino-abstract-transport')
const { Transform, pipeline } = require('stream')
const stringify = require('fast-safe-stringify')

const severity = {
  emergency: 0,
  alert: 1,
  critical: 2,
  error: 3,
  warning: 4,
  notice: 5,
  info: 6,
  debug: 7
}

function levelToSeverity (level) {
  let result
  switch (level) {
    case 10: // pino: trace
      result = severity.debug
      break
    case 20: // pino: debug
      result = severity.debug
      break
    case 30: // pino: info
      result = severity.info
      break
    case 40: // pino: warn
      result = severity.warning
      break
    case 50: // pino: error
      result = severity.error
      break
    case 60: // pino: fatal
    default:
      result = severity.critical
      break
  }
  return result
}

function getStream (fileDescriptor) {
  if (fileDescriptor === 1 || !fileDescriptor) return process.stdout
  else if (fileDescriptor === 2) return process.stderr
  else if (fileDescriptor !== undefined) return SonicBoom({ dest: parseInt(fileDescriptor), sync: false })
}

function processMessage(obj) {
  const severity = levelToSeverity(obj.level);
  return `<${severity}>${stringify(obj)}\n`;
} 

function pinoTransport (opts) {
  let destination
  if (opts.enablePipelining !== true) {
    destination = getStream(opts.destination)
  }

  return build(function (source) {
    const stream = new Transform({
      objectMode: true,
      autoDestroy: true,
      transform (obj, enc, cb) {
        cb(null, processMessage(obj))
      }
    })

    const pipeflow = [
      source,
      stream
    ]

    if (destination) {
      pipeflow.push(destination)
    }
    pipeline(pipeflow, () => {
      // finished piping
    })

    return stream
  }, {
    enablePipelining: opts.enablePipelining
  })
}

module.exports = pinoTransport