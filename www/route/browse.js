const el = require('../el/_el.js')
const data = require('../service/data.js')
const event = require('../service/event.js')
const http = require('../service/http.js')
const profileNotFound = require('./profilenotfound.js')

module.exports = () => {
  
  const profile = data`profile`()
  if(!profile) return profileNotFound()
  const member = data`member`()
  if(!member) return location.hash = '#signup'

  let page = 0
  const browsePosts = async () => {
    const posts = await http.post(`browse`, {page})
    const pageInput = document.getElementById(pageId)
    pageInput.value = page + 1
    const postsDiv = document.getElementById('posts')
    postsDiv.innerHTML = ''
    if(posts.length)
      posts.forEach(post => event.append(postsDiv, el.post(post)))
    else
      postsDiv.innerHTML = `<h1 class="white-text">No posts yet...</h1>`
  }
  browsePosts()

  const pageId = event.el(el => {
    el.addEventListener('change', () => {
      page = el.value - 1
      browsePosts()
    })
  })

  const route = el.route(  
    el.row(
      el.col('s12 m3',
        el.mb_card(profile, true, false), 
        el.card('', `
          <div class="input-field">
            <input id="${pageId}" type="number" min="1">
            <label for="${pageId}" class="active">Page</label>
          </div>
        `),
        el.card('s12 black white-text', `             
          <p><b>Cost</b></p>
          <p class="flex-center v-align">${el.icon('thumb_up')} ${el.cost('0.006', 18)}</p>
        `)
      ),        
      el.col('s12 m9',
        `<div id="posts" class="flex-center flex-wrap browse-feed"></div>`
      )
    )
  )
  
  return el.nav(route, true, true)
}