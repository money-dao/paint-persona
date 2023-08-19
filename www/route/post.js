const el = require('../el/_el.js')
const event = require('../service/event.js')
const data = require('../service/data.js')

module.exports = () => {

  let post = {
    size: 180,
    swag: []
  }
  data`edit-post`(post)

  const profile = data`profile`()
  const checkboxId = event.el(el => {
    el.addEventListener('change', () => {
      post = data`edit-post`()
      post.size = el.checked ? 180 : 270
      data`edit-post`(post)
      const card = document.querySelector(el.checked ? '.card-sm' : '.card-lg')
      card.classList.remove(el.checked ? 'card-sm' : 'card-lg')
      card.classList.add(!el.checked ? 'card-sm' : 'card-lg')
    })
  })
 
  return profile 
  ? el.route(  
    el.swag_nav(),
    el.row(
      el.col('s12 m3',
        el.mb_card(profile.img, profile.title, false), 
        `<a class="waves-effect waves-light btn col s12" href="#profile">Post (10)</a>`,
        `<a class="waves-effect waves-light btn col s12" href="#profile">Cancel</a>`,
      ),
      el.col('s12 m9',
        `<h1 class="white-text">New Post</h1>`,
        `<div class="switch">
          <label class="white-text">
            Small - 180px
            <input type="checkbox" id="${checkboxId}">
            <span class="lever"></span>
            Large - 270px
          </label>
        </div>`,
        `<div class="flex-center">`,
          el.post(),          
        `</div>`,
        `<div class="row">
          <a data-target="swag-nav" class="sidenav-trigger waves-effect waves-light btn col s6 offset-s3"><i class="material-icons">menu</i></a>
        </div>`,
        `<div id="swag"></div>`
      )
    )
  )
  : '<div class="container"><h1>Profile not found</h1><a href="#">Home</a></div>'
}