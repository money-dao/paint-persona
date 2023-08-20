const router = require('../service/router.js')
const event = require('../service/event.js')
const data = require('../service/data.js')

const mb_card = (img, title, profileBtn) => {

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
      </div>
    </div>
  `
}
module.exports = mb_card
