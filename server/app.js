const server = require('./util/server.js')
//services
const service = require('./service/service.js')
const web3 = require('./service/web3.js')
//routes
const balance = require('./route/balance.js')
//html
server.serve('4200')
