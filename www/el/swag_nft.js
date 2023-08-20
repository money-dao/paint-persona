const data = require('../service/data.js')
const event = require('../service/event.js')
const card = require('./card.js')
const swagPosition = require('../prefab/swag_position.js')

const swag_nft = () => {
  //init
  const id = event.guid()
  const post = data`edit-post`()
  const swag = {
    id,
    type: 'text',
    value: 'Enter text...',
    font: 12,
    pos: {
      x: 5,
      y: 5,
      r: 0
    }
  }
  post.swag.push(swag)
  event.dispatch`editpost`(`.post`)

  //ids
  const { posTabId, posxId, posyId, posrId } = swagPosition()

  

  
  return card(`swag-nft ${id}`,
    `
      <h6>${post.swag.length}. NFT</h6>
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
          <li class="tab col s4"><a class="waves-effect waves-light active col" id="${textTabId}"><i class="material-icons">text_fields</i></a></li>
          <li class="tab col s4"><a class="waves-effect waves-light col" id="${posTabId}"><i class="material-icons">gamepad</i></a></li>
          <li class="tab col s4"><a class="waves-effect waves-light col" id="${removeId}"><i class="material-icons">remove_circle</i></a></li>
        </ul>
      </div
    `
  )
}
module.exports = swag_nft