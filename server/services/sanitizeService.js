
const sanitize = function sanitizeFunc(dataFromClient, properties) {
  const sanitizedData = {}
  properties.forEach(prop => {
    if (dataFromClient[prop]) {
      sanitizedData[prop] = dataFromClient[prop]
    }
  })
  return sanitizedData
}

module.exports = {
  sanitize,
}