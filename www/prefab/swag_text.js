const data = require('../service/data.js')
const event = require('../service/event.js')
const swagService = require('../service/swag.js')

const swagText = (id) => {
  const swag = swagService(id)

  const textId = event.el(el => {
    el.addEventListener('keyup', e => {
      editSwag(swag => swag.value = el.value)
      event.dispatch`editpost`(`.post`)
    })
  })
  const fontId = event.el((el, fontId) => {
    el.addEventListener('change', () => {
      let val = el.value
      editSwag(swag => swag.font = parseInt(val))
      const label = swagEl().querySelector(`label[for=${fontId}]`)
      label.innerText = `Font: ${val}`
      event.dispatch`editpost`(`.post`)
    })
  })
  const textTabId = event.el(tabfn)

  return {
    textId,
    fontId,
    textTabId
  }
}
module.exports = swagText
