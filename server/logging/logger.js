const bunyan = require('bunyan')
const consoleStream = require('bunyan-console-stream')

const streamOptions = {
  stderrThreshold:40 //log warning, error and fatal messages on STDERR
};

const logger = bunyan.createLogger({
  name: 'main',
  streams:[{
    type: 'raw',
    stream: consoleStream.createStream(streamOptions)
  }],
  level: 'info',
  serializers: bunyan.stdSerializers
})

module.exports = logger