const server = require('../util/server.js')
const service = require('../service/service.js')

module.exports = server.post('like', async body => {
  return await service.web3.like(  
    body.txId,
    body.postId,
    body.userId
  )
})