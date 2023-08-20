const data = require('../service/data.js')
const event = require('../service/event.js')
const card = require('./card.js')

const renderSwag = swag => {
  let style, classList
  switch(swag.type){
    case 'text':
      style = `left: ${swag.pos.x}px;top: ${swag.pos.y}px;font-size: ${swag.font}px;transform: rotate(${swag.pos.r}deg);`
      return `<p style="${style}" class="flow-text">${swag.value}</p>`
    case 'nft':
      style = `left: ${swag.pos.x}px;top: ${swag.pos.y}px;width: ${swag.size}px;transform: rotate(${swag.pos.r}deg);`
      classList = `${swag.circle ? 'circle' : ''}`
      return `<img style="${style}" src="${swag.value.image}" title="${swag.value.name}" class="${classList}">`
  }
}

const post = () => {

  const innerId = event.el(el => {
    el.addEventListener('editpost', e => {
      const post = data`edit-post`()
      el.innerHTML = ''
      if(post.swag)
        post.swag.forEach(swag => event.append(el, renderSwag(swag)))
    })
  })
    
  return card('card-sm',
    `<div class="post" id="${innerId}"></div>`  
  )          
}
module.exports = post