const el = require('../el/_el.js')
const data = require('../service/data.js')
const event = require('../service/event.js')
const http = require('../service/http.js')
const profileNotFound = require('./profilenotfound.js')

module.exports = () => {
  
  const profile = data`profile`()
  if(!profile) return profileNotFound()

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
  
  return el.nav(
    el.route(  
      el.row(
        el.col('s12 m3',
          el.mb_card(profile), 
          `<div><b class="white-text">Browse</b></div>`,
          el.card('',
            `<div class="input-field col s12">
              <input id="${pageId}" type="number" min="1">
              <label for="${pageId}" class="active">Page</label>
            </div>`
          )
        ),        
        el.col('s12 m9',
          `<div id="posts" class="flex-center flex-wrap browse-feed"></div>`
        )
      )
    )
  )
}