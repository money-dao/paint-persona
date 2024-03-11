
/* services */
const s = require('./service/service.js')

let debug; 

const start = () => {
  require('./service/diamondbattler-play.js')
  require('./service/diamondbattler.js')

  /* routes */
  require('./route/hostreport.js')
  require('./route/joinDiamondQue.js')

  // require('./route/loadProfile.js')
  // require('./route/loadRevenue.js')
  // require('./route/post.js')
  // require('./route/like.js')
  // require('./route/subscribe.js')
  // require('./route/browse.js')
  // require('./route/signup.js')

  /* start server */
  const server = require('./util/server.js')
  server.serve('4200')
}
!debug ? start() : debug()
