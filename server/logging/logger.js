const logdna = require('logdna')
const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json()
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

if (process.env.NODE_ENV !== 'dev') {
  var options = {
    key: process.env.loggerKey,
    env: process.env.NODE_ENV,
    index_meta: true,
    handleExceptions: true
  };
  
  //logger.add(new logdna.WinstonTransport(options));
}


module.exports = logger