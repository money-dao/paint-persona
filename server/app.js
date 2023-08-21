const server = require('./util/server.js')
//services
const service = require('./service/service.js')
const db = require('./service/db.js')
const web3 = require('./service/web3.js')
//routes
const post = require('./route/post.js')
//html
server.serve('4200')