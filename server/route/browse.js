const server = require('../util/server.js')
const service = require('../service/service.js')

module.exports = server.post('browse', async body => {
  return await service.web3.browse(  
    body.page
  )
})