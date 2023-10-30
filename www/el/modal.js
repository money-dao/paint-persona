const event = require('../service/event.js')

module.exports = (id, content, footer) => {

  event.fn(() => {
    const el = document.getElementById(id)
    el.addEventListener('modal', e => {
      if(e.detail.on)
        el.classList.add('open')
      else
        el.classList.remove('open')
    })  
  })
  
  return `
    <div class="modal-bg" id="${id}">
      <div class="modal modal-fixed-footer">
        <div class="modal-content">
          ${content}
        </div>
        <div class="modal-footer">
          ${footer}
        </div>
      </div>
    </div>
  `
}