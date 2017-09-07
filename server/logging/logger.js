const bunyan = require('bunyan')

const logger = bunyan.createLogger({
  name: 'logger'
})

module.exports = logger