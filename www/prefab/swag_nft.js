const data = require('../service/data.js')
const event = require('../service/event.js')
const swagService = require('../service/swag.js')

const swagNft = (id, settingsTabId) => {
  const swag = swagService(id)

  const nfts = data`nfts`()
  const allNfts = [...nfts.boys, ...nfts.girls, ...nfts.diamonds, ...nfts.mansions]

  const selectNftId = nft => event.click(() => {
    swag.edit(swag => swag.value = {
      image: nft.image,
      name: nft.name
    })
    event.dispatch`editpost`(`.post`)
    event.dispatch`editpost`(`#${settingsTabId}`)
  })

  const selectNft = () => allNfts.map(nft => `
    <a id="${selectNftId(nft)}" class="col s2 hoverable"><img src="${nft.image}" class="col s12"></a>    
  `).join('')

  const nftTabId = event.el(swag.tabfn)

  return {
    nftTabId, selectNft
  }
}
module.exports = swagNft
