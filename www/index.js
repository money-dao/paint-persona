const router = require('./service/router.js')
const home = require('./route/home.js')
const profile = require('./route/profile.js')
const post = require('./route/post.js')
const pageNotFound = require('./route/pagenotfound.js')

router.init(pageNotFound, {
  '': home,
  '#home': home,
  '#profile': profile,
  '#post': post})