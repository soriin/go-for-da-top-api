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
  
  logger.add(winston.transports.Logdna, options);
}


module.exports = logger