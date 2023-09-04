const router = require('./service/router.js')
const home = require('./route/home.js')
const profile = require('./route/profile.js')
const post = require('./route/post.js')
const hub = require('./route/hub.js')
const signup = require('./route/signup.js')
const browse = require('./route/browse.js')
const pageNotFound = require('./route/pagenotfound.js')

if(!location.href.includes('#'))
  location.hash = '#'

router.init(pageNotFound, {
  '': home,
  '#': home,
  '#hub': hub,
  '#profile': profile,
  '#post': post,
  '#browse': browse,
  '#signup': signup
})