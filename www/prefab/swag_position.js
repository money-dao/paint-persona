const data = require('../service/data.js')
const event = require('../service/event.js')
const swagService = require('../service/swag.js')

const swagPosition = (id) => {
  const swag = swagService(id)

  const posfn = (key) => {
    return event.el((el, posId) => {
      el.addEventListener('change', () => {
        let val = el.value
        swag.edit(swag => swag.pos[key] = parseInt(val))
        const label = swag.el().querySelector(`label[for=${posId}]`)
        label.innerText = `${key}: ${val}`
        event.dispatch`editpost`(`.post`)
      })
    })
  }

  const posTabId = event.el(swag.tabfn)

  const posxId = posfn('x')
  const posyId = posfn('y')
  const posrId = posfn('r')

  return {
    posTabId,
    posxId,
    posyId,
    posrId
  }  
}
module.exports = swagPosition