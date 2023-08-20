const data = require('../service/data.js')
const event = require('../service/event.js')

const swag = (id) => {

  const swagEl = () => document.querySelector(`.${id}`)

  const getSwag = () => {
    const post = data`edit-post`()
    return post.swag.find(swag => {
      if(swag.id === id){
        return swag
      }
    })
  }

  const editSwag = fn => {
    const post = data`edit-post`()
    post.swag.find(swag => {
      if(swag.id === id){
        fn(swag)    
        return swag
      }
    })
    data`edit-post`(post)
  }

  const tabfn = (el, tabId) => {
    el.addEventListener('click', () => {
      swagEl().querySelectorAll('section').forEach(section => {
        if(section.classList.contains(tabId))
          section.classList.remove('hide')
        else
          section.classList.add('hide')
      })
    })
  }

  return {
    el: swagEl,
    edit: editSwag,
    get: getSwag,
    tabfn
  }
}
module.exports = swag