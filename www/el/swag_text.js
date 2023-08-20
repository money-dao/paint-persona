const data = require('../service/data.js')
const event = require('../service/event.js')
const card = require('./card.js')
const swagText = require('../prefab/swag_text.js')
const swagPosition = require('../prefab/swag_position.js')

const swag_text = () => {
  //init
  const id = event.guid()
  const post = data`edit-post`()
  const swag = {
    id,
    type: 'text',
    value: 'Enter text...',
    font: 12,
    color: '#000',
    pos: {
      x: 5,
      y: 5,
      r: 0
    }
  }
  post.swag.push(swag)
  event.dispatch`editpost`(`.post`)

  //ids

  const { textTabId, textId, fontId, colorId } = swagText(id)
  const { posTabId, posxId, posyId, posrId } = swagPosition(id)
  
  const removeId = event.el(el => {
    el.addEventListener('click', () => {
      const post = data`edit-post`()
      post.swag = post.swag.filter(swag => swag.id !== id)
      data`edit-post`(post)
      event.dispatch`editpost`(`#swag-nav`, swag)
    })
  })

  const swagEl = () => document.querySelector(`.${id}`)  
  event.fn(() => {
    const tabs = swagEl().querySelector('.tabs')
    M.Tabs.init(tabs, {})
  })
  
  return card(`swag-text ${id}`,
    `
      <h6>${post.swag.length}. Text</h6>
      <section class="${textTabId}">
        <div>
          <div class="input-field">
            <input id="${textId}" type="text" class="validate">
            <label for="${textId}">${swag.value}</label>
          </div>
        </div>
        <div>
          <p class="range-field">
            <input type="range" id="${fontId}" value="${swag.font}" min="8" max="54" />
            <label for="${fontId}">Font: ${swag.font}</label>
          </p>
        </div>
        <div>
          <div class="input-field">
            <input id="${colorId}" type="color" class="btn" style="babckground:${swag.color};">
          </div>
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
          <li class="tab col s4"><a class="waves-effect waves-light active col" id="${textTabId}"><i class="material-icons">text_fields</i></a></li>
          <li class="tab col s4"><a class="waves-effect waves-light col" id="${posTabId}"><i class="material-icons">gamepad</i></a></li>
          <li class="tab col s4"><a class="waves-effect waves-light col" id="${removeId}"><i class="material-icons">remove_circle</i></a></li>
        </ul>
      </div
    `
  )
}
module.exports = swag_text