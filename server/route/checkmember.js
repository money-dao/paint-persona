const server = require('../util/server.js')
const service = require('../service/service.js')

module.exports = server.post('checkmember', async body => {
  return await service.web3.checkMembership(  
    body.userId
  )
})