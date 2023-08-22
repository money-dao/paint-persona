const el = require('../el/_el.js')
const data = require('../service/data.js')
const profileNotFound = require('./profilenotfound.js')

module.exports = () => {
  
  const profile = data`profile`()
  if(!profile) return profileNotFound()
  
  return el.nav(
    el.route(  
      el.row(
        el.col('s12 m3',
          el.mb_card(profile.img, profile.title, false), 
          `<a class="waves-effect waves-light btn col s12" href="#profile">Profile</a>`,
          `<a class="waves-effect waves-light btn col s12" href="#post">Post</a>`,
        ),        
        el.col('s12 m9',
          `<h1 class="white-text">Browse</h1>`
        )
      )
    )
  )
}