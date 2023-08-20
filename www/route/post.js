const el = require('../el/_el.js')
const event = require('../service/event.js')
const data = require('../service/data.js')
const profileNotFound = require('./profilenotfound.js')

module.exports = () => {

  const profile = data`profile`()
  if(!profile) return profileNotFound()
  
  let post = {
    size: 180,
    color: '#fff',
    swag: []
  }
  data`edit-post`(post)
  
  const cardsizeId = event.el(el => {
    el.addEventListener('change', () => {
      post = data`edit-post`()
      post.size = el.checked ? 180 : 270
      data`edit-post`(post)
      const card = document.querySelector(el.checked ? '.card-sm' : '.card-lg')
      card.classList.remove(el.checked ? 'card-sm' : 'card-lg')
      card.classList.add(!el.checked ? 'card-sm' : 'card-lg')
    })
  })

  const colorBalls = () => {
    const colors = [
      '#fff', //default
      '#fff87f', //yellow
      '#77f5ff', //cyan
      '#9a94ff', //purple
      '#fece95', //skin light
      '#feab6f', //orange
      '#fd91a7', //red
      '#7fff9a', //green
      '#6288fe' //purpleblue
    ]

    const setColor = color => event.click(el => {
      const post = data`edit-post`()
      post.color = color
      data`edit-post`(post)
      event.dispatch`editpost`('.post')
    })

    return colors.map(color => `
        <button id="${setColor(color)}" class="circle color-ball btn" style="background: ${color};"></button>
      `).join('')
  }
 
  return el.nav(
    el.route(  
      el.swag_nav(),
      el.row(
        el.col('s12 m3',
          el.mb_card(profile.img, profile.title, false), 
          `<a class="waves-effect waves-light btn col s12" href="#profile">Post 0.03 sol</a>`,
          `<a class="waves-effect waves-light btn col s12" href="#profile">Cancel</a>`,
        ),
        el.col('s12 m9',
          `<h1 class="white-text">New Post</h1>`,
          el.row(
            `<div class="switch">
              <label class="white-text">
                Small - 180px
                <input type="checkbox" id="${cardsizeId}">
                <span class="lever"></span>
                Large - 270px
              </label>
            </div>`
          ),
          el.row(colorBalls()),
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
  )
}