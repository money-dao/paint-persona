const data = require('../service/data.js')
const event = require('../service/event.js')
const card = require('./card.js')

const renderSwag = swag => {
  switch(swag.type){
    case 'text':
      let style = `left: ${swag.pos.x}px;top: ${swag.pos.y}px;font-size: ${swag.font}px;transform: rotate(${swag.pos.r}deg);`
      return `<p style="${style}" class="flow-text">${swag.value}</p>`
  }
}

const post = () => {

  const innerId = event.el(el => {
    el.addEventListener('editpost', e => {
      const post = data`edit-post`()
      el.innerHTML = ''
      if(post.swag)
        post.swag.forEach(swag => el.innerHTML += renderSwag(swag))
    })
  })
    
  return card('card-sm',
    `<div class="post" id="${innerId}"></div>`  
  )          
}
module.exports = post