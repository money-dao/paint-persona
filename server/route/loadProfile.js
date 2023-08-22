const server = require('../util/server.js')
const service = require('../service/service.js')

module.exports = server.post('loadprofile', async body => {
  return await service.web3.loadProfilePosts(  
    body.userPubkey,
    body.mbPubkey
  )
})