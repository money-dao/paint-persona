const router = require('./service/router.js')
const home = require('./route/home.js')
const profile = require('./route/profile.js')
const post = require('./route/post.js')
const hub = require('./route/hub.js')
const pageNotFound = require('./route/pagenotfound.js')

router.init(pageNotFound, {
  '': home,
  '#hub': hub,
  '#profile': profile,
  '#post': post})