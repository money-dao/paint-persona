const server = require('./util/server.js')
//services
require('./service/service.js')
require('./service/db.js')
require('./service/web3.js')
//routes
require('./route/loadProfile.js')
require('./route/post.js')
require('./route/like.js')
require('./route/subscribe.js')
//html
server.serve('4200')