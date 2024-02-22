const server = require('../util/server.js')
const service = require('../service/service.js')

module.exports = server.post('hostReport', async body => {
  return await service.diamondbattler.hostReport( body.id )
})
