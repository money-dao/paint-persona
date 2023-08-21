const data = require('../service/data.js')
const event = require('../service/event.js')
const swagService = require('../service/swag.js')

const swagSettings = (id) => {
  const swag = swagService(id)

  const fn = (key, checked) => event.el((el, posId) => {
    el.addEventListener('change', () => {
      let val = el.value
      if(checked) val = el.checked
      swag.edit(swag => swag[key] = checked ? val : parseInt(val))
      if(!checked){
        const label = swag.el().querySelector(`label[for=${posId}]`)
        label.innerText = `${key}: ${val}`
      }
      event.dispatch`editpost`(`.post`)
    })
  })

  const sizeId = fn('size')
  const circleId = fn('circle', true)

  const settingsTabId = event.el((el, id) => {
    swag.tabfn(el, id)
    el.addEventListener('editpost', () => 
      el.firstChild.src = swag.get().value?.image
    )
  })

  return {
    settingsTabId,
    sizeId,
    circleId
  }
}
module.exports = swagSettings
