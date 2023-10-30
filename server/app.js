const server = require('./util/server.js')

/* services */
require('./service/service.js')
require('./service/db.js')
require('./service/w3validate.js')
require('./service/web3.js')
require('./service/diamondbattler.js')

/* routes */
require('./route/loadProfile.js')
require('./route/loadRevenue.js')
require('./route/post.js')
require('./route/like.js')
// require('./route/subscribe.js')
require('./route/browse.js')
require('./route/signup.js')

/* start server */
server.serve('4200')