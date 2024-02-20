const server = require('../util/server.js')
const service = require('../service/service.js')

module.exports = server.post('joinQue', async body => {
  return await service.diamondbattler.joinQue( body.txId, body.userId )
})
