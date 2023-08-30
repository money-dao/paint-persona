const data = require('../service/data.js')
const event = require('../service/event.js')
const http = require('../service/http.js')
const w3 = require('../service/w3.js')
const card = require('./card.js')

const renderSwag = swag => {
  let style, classList
  switch(swag.type){
    case 'text':
      style = `color: ${swag.color};left: ${swag.pos.x}px;top: ${swag.pos.y}px;font-size: ${swag.font}px;transform: rotate(${swag.pos.r}deg);`
      return `<p style="${style}" class="flow-text">${swag.value}</p>`
    case 'nft':
      style = `left: ${swag.pos.x}px;top: ${swag.pos.y}px;width: ${swag.size}px;transform: rotate(${swag.pos.r}deg);`
      classList = ''
      if(swag.circle == true || swag.circle == 'true')
        classList += 'circle'
      return `<img style="${style}" src="${swag.value.image}" title="${swag.value.name}" class="${classList}">`
  }
}
const render = (el, post) => {
  el.innerHTML = ''
  if(post.swag)
    post.swag.forEach(swag => event.append(el, renderSwag(swag)))
  el.parentElement.parentElement.style.background = post.color
}

const post = (loadedPost) => {

  const innerId = event.el(el => {
    if(!loadedPost)
      el.addEventListener('editpost', e => {
        const post = data`edit-post`()
        render(el, post)
      })
    else 
      render(el, loadedPost)
  })

  let reactId = event.el(el => {
    if(!loadedPost){
      el.classList.add('hide')
    } else {
      el.querySelector('img').src = loadedPost.mb.image
      el.querySelector('img').title = loadedPost.mb.name
    } 
  })

  const profileId = event.click(el => {
    data`profile`({
      img: loadedPost.mb.image,
      title: loadedPost.mb.name,
      nft: {address: {toString: () => loadedPost.mb.key}}
    })
    location.hash = '#profile'
  })

  const likeId = event.click(async el => {
    const signature = await w3.send_tx(w3.Cost.Like)
    const userId = data`pubkey`().toString()
    const res = await http.post('like', {
      txId: signature,
      postId: loadedPost?.id,
      userId
    })
    console.log(res)
    if(res.likes) el.innerHTML = res.likes
  })

  const subscribeId = event.click(async el => {
    const userPubkey = data`pubkey`().toString()
    const res = await http.post('subscribe', {
      txId: '',
      postId: loadedPost?.id,
      userPubkey,
      mbPubkey: loadedPost?.mb?.key
    })
    console.log(res)
  })
    
  return `
    <div class="post-frame">
      ${card(`card-${loadedPost ? (loadedPost.size === '180' ? 'sm' : 'lg') : 'sm'}`,
        `<div class="post" id="${innerId}"></div>`  
      )}
      <div id="${reactId}" class="post-react">
        <a id="${profileId}"><img class="circle"></a>
        <div>
          <button id="${likeId}" class="btn-floating waves-effect waves-light pink"><i class="material-icons">mood</i></button>
          <button id="${subscribeId}" class="btn-floating waves-effect waves-light green"><i class="material-icons">person_add</i></button>
        </div>
      </div>
    </div>
  `          
}
module.exports = post