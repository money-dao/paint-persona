const server = require('../util/server.js')
const service = require('../service/service.js')

module.exports = server.post('signup', async body => {
  return await service.web3.signup(  
    body.txId, 
    body.userId
  )
})