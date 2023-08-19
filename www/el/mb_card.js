const router = require('../service/router.js')
const event = require('../service/event.js')
const data = require('../service/data.js')

const mb_card = (img, title, profileBtn) => {
  let posts = parseInt(Math.random() * 200)
  let likes = parseInt(Math.random() * posts * (Math.random() * 12))
  let subscribers = parseInt(Math.random() * posts * .3)
  const paint = (...v) => parseInt(v[0] * v[1])

  const profileId = event.el(el => {
    if(profileBtn !== false) {
      router.pushfn(() => {
        if(el) el.addEventListener('click', (e) => {
          e.preventDefault()
          data`profile`({img, title})
          location.hash = '#profile'
        })
      })
    }
  })
  
  return `
    <div class="card">
      <div class="card-image">
        <img src="${img}">
        ${
          profileBtn !== false 
          ? `<a class="btn-floating halfway-fab waves-effect waves-light red" href="#profile" id="${profileId}"><i class="material-icons">account_circle</i></a>`
          : ''
        }
      </div>
      <div class="card-content yellow lighten-5">
        <span class="card-title">${title}</span>
        <p>${posts} Posts -${paint(posts, 10)}</p>
        <p>${likes} Likes +${paint(likes, 3)}</p>
        <p>${subscribers} Subs +${paint(subscribers, 30)}</p>
        <p>${(paint(likes, 3) + paint(subscribers, 30)) - paint(posts, 10)}</p>
      </div>
    </div>
  `
}
module.exports = mb_card
