const data = require('../service/data.js')
const event = require('../service/event.js')
const card = require('./card.js')

const swag_text = () => {
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

  const swagEl = () => document.querySelector(`.${id}`)
  
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
  
  const textId = event.el(el => {
    el.addEventListener('keyup', e => {
      editSwag(swag => swag.value = el.value)
      event.dispatch`editpost`(`.post`)
    })
  })

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

  const posfn = (key) => {
    return event.el((el, posId) => {
      el.addEventListener('change', () => {
        let val = el.value
        editSwag(swag => swag.pos[key] = parseInt(val))
        const label = swagEl().querySelector(`label[for=${posId}]`)
        label.innerText = `${key}: ${val}`
        event.dispatch`editpost`(`.post`)
      })
    })
  }

  const textTabId = event.el(tabfn)
  const posTabId = event.el(tabfn)

  const posxId = posfn('x')
  const posyId = posfn('y')
  const posrId = posfn('r')

  const fontId = event.el((el, fontId) => {
    el.addEventListener('change', () => {
      let val = el.value
      editSwag(swag => swag.font = parseInt(val))
      const label = swagEl().querySelector(`label[for=${fontId}]`)
      label.innerText = `Font: ${val}`
      event.dispatch`editpost`(`.post`)
    })
  })
  
  const removeId = event.el(el => {
    el.addEventListener('click', () => {
      const post = data`edit-post`()
      post.swag = post.swag.filter(swag => swag.id !== id)
      data`edit-post`(post)
      event.dispatch`editpost`(`#swag-nav`, swag)
    })
  })

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