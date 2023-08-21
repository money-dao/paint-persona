const server = require('../util/server.js')
const service = require('../service/service.js')

module.exports = server.post('post', async body => {
  return await service.web3.post(  
    body.txId, 
    body.pubkey, 
    body.post  
  )
})