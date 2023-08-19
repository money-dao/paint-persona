const server = require('../util/server.js')
const service = require('../service/service.js')

module.exports = server.post('balance', async body => {
  return service.web3.balance()
})