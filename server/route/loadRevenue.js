const server = require('../util/server.js')
const service = require('../service/service.js')

module.exports = server.post('loadrevenue', async body => {
  return await service.web3.loadRevenue( body.mbAr )
})