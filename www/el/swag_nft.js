const data = require('../service/data.js')
const event = require('../service/event.js')
const card = require('./card.js')
const swagPosition = require('../prefab/swag_position.js')
const swagNft = require('../prefab/swag_nft.js')
const swagSettings = require('../prefab/swag_settings.js')

const swag_nft = () => {
  //init  
  const id = event.guid()
  const post = data`edit-post`()
  const swag = {
    id,
    type: 'nft',
    value: undefined,
    size: 45,
    circle: false,
    pos: {
      x: 5,
      y: 5,
      r: 0
    }
  }

  const nfts = data`nfts`()
  const allNfts = [...nfts.boys, ...nfts.girls, ...nfts.diamonds, ...nfts.mansions]
  if(allNfts.length > 0) 
    swag.value = {
      image: allNfts[0].image,
      name: allNfts[0].name
    }
  
  post.swag.push(swag)
  event.dispatch`editpost`(`.post`)

  //ids
  const { posTabId, posxId, posyId, posrId } = swagPosition(id)
  const { settingsTabId, sizeId, circleId } = swagSettings(id)
  const { nftTabId, selectNft } = swagNft(id, settingsTabId)
    
  const removeId = event.el(el => {
    el.addEventListener('click', () => {
      const post = data`edit-post`()
      post.swag = post.swag.filter(swag => swag.id !== id)
      data`edit-post`(post)
      event.dispatch`editpost`(`#swag-nav`, swag)
    })
  })
  
  return card(`swag-nft ${id}`,
    `
      <h6>${post.swag.length}. NFT</h6>
      <section class="${settingsTabId} active">
        <div class="row">
          <label>
            <input type="checkbox" id="${circleId}" />
            <span>Circular</span>
          </label>
          <p class="range-field">
            <input type="range" id="${sizeId}" value="${swag.size}" min="30" max="270" />
            <label for="${sizeId}">size: ${swag.size}</label>
          </p>
        </div>
      </section>
      <section class="${nftTabId} hide">
        <div class="row">
          ${selectNft()}
        </div>
      </section>
      <section class="${posTabId} hide">
        <p class="range-field">
          <input type="range" id="${posxId}" value="${swag.pos.x}" min="0" max="330" />
          <label for="${posxId}">x: ${swag.pos.x}</label>
        </p>
        <p class="range-field">
          <input type="range" id="${posyId}" value="${swag.pos.y}" min="0" max="270" />
          <label for="${posyId}">y: ${swag.pos.y}</label>
        </p>
        <p class="range-field">
          <input type="range" id="${posrId}" value="${swag.pos.r}" min="0" max="360" />
          <label for="${posrId}">rotation: ${swag.pos.r}</label>
        </p>
      </section>
      <div class="col s12">
        <ul class="tabs">
          <li class="tab col s3"><a class="waves-effect waves-light col" id="${settingsTabId}"><img class="col s6" src="${swag.value.image}"></a></li>
          <li class="tab col s3"><a class="waves-effect waves-light col" id="${nftTabId}"><i class="material-icons">image</i></a></li>
          <li class="tab col s3"><a class="waves-effect waves-light col" id="${posTabId}"><i class="material-icons">gamepad</i></a></li>
          <li class="tab col s3"><a class="waves-effect waves-light col" id="${removeId}"><i class="material-icons">remove_circle</i></a></li>
        </ul>
      </div
    `
  )
}
module.exports = swag_nft