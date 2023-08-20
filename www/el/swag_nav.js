const event = require('../service/event.js')
const swagText = require('./swag_text.js')
const swagNFT = require('./swag_nft.js')

const swagNav = () => {
  event.fn(() => {
    const elems = document.querySelectorAll('.sidenav')
    M.Sidenav.init(elems, {})
    const nav = document.getElementById('swag-nav')
    nav.addEventListener('editpost', e => {
      const swagDiv = document.getElementById('swag')
      let el = swagDiv.querySelector(`.${e.detail.id}`)
      if(el) {
        swagDiv.removeChild(el)
        event.dispatch`editpost`('.post')
      }
    })
  })

  const textId = event.el((el, id) => {
    el.addEventListener('click', () => {
      const div = document.getElementById('swag')
      event.prepend(div, swagText())
    })
  })

  const nftId = event.el((el, id) => {
    el.addEventListener('click', () => {
      const div = document.getElementById('swag')
      event.prepend(div, swagNFT())
    })
  })
  
  return `
    <ul id="swag-nav" class="sidenav">
      <li><a class="waves-effect" id="${textId}">Text</a></li>
      <li><a class="waves-effect" id="${nftId}">NFT</a></li>
      <li><a class="waves-effect">Link</a></li>
    </ul>
  `
}

module.exports = swagNav