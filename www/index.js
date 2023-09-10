const router = require('./service/router.js')

router.init('#pagenotfound', {
  '#': require('./route/home.js'),
  '#hub': require('./route/hub.js'),
  '#profile': require('./route/profile.js'),
  '#post': require('./route/post.js'),
  '#browse': require('./route/browse.js'),
  '#signup': require('./route/signup.js'),
  '#support': require('./route/support.js'),
  '#profilenotfound': require('./route/profilenotfound.js'),
  '#pagenotfound': require('./route/pagenotfound.js')
})