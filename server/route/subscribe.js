const server = require('../util/server.js')
const service = require('../service/service.js')

module.exports = server.post('subscribe', async body => {
  return await service.web3.subscribe(  
    body.txId,
    body.postId,
    body.userPubkey,
    body.mbPubkey
  )
})