const el = require('../el/_el.js')
const event = require('../service/event.js')
const data = require('../service/data.js')
const db = require('../service/db.js')
const http = require('../service/http.js')
const profileNotFound = require('./profilenotfound.js')

module.exports = () => {

  const profile = data`profile`()
  if(!profile) return profileNotFound()

  const pubkey = data`pubkey`()
  
  let post = {
    id: event.guid(),
    creator: pubkey.toString(),
    mb: {
      key: profile.nft.address.toString(),
      name: profile.title,
      image: profile.img
    },
    size: 180,
    color: '#fff',
    swag: []
  }
  data`edit-post`(post)
  
  const cardsizeId = event.el(el => {
    el.addEventListener('change', () => {
      post = data`edit-post`()
      post.size = el.checked ? 270 : 180
      data`edit-post`(post)
      console.log("POST SIZE", post.size)
      const card = document.querySelector(el.checked ? '.card-sm' : '.card-lg')
      card.classList.remove(el.checked ? 'card-sm' : 'card-lg')
      card.classList.add(!el.checked ? 'card-sm' : 'card-lg')
    })
  })

  const colorBalls = () => {
    const colors = [
      '#fff', //default
      '#141414', //space
      '#fff87f', //yellow
      '#77f5ff', //cyan
      '#9a94ff', //purple
      '#fece95', //skin light
      '#876451', //skin dark
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

  const postId = event.click(() => {
    const post = data`edit-post`()
    console.log('POST SIZE', post.size)
    const pubkey = data`pubkey`().toString()
    //TODO: send money
    const txId = ''
    
    post.date = new Date().toDateString()
    post.time = new Date().getTime()
    console.log(post)
    http.post('post', { txId, pubkey, post })
  })
 
  return el.nav(
    el.route(  
      el.swag_nav(),
      el.row(
        el.col('s12 m3',
          el.mb_card(profile, false), 
          `<a class="waves-effect waves-light btn col s12" id="${postId}">Post 0.03 sol</a>`,
          `<a class="waves-effect waves-light btn col s12" href="#profile">Cancel</a>`,
        ),
        el.col('s12 m9',
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