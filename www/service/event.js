const router = require('./router.js')

const guid = (r, v) =>
'pp-xxxx-4xxx-yxxx'.replace(/[xy]/g, c => 
  (r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8))
  .toString(16))

const el = fn => {
  let id = guid()
  router.pushfn(() => setTimeout(() => {
    const element = document.getElementById(id)
    if(element) fn(element, id)
  }, 0))
  return id
}

const fn = fn => {
  if(!router.loaded()) router.pushfn(fn)
  else setTimeout(() => fn(), 0)
}

const dispatch = (...e) => {
  const type = e[0][0]
  return (query, detail) => {
    const ar = document.querySelectorAll(query)
    ar.forEach(el => el.dispatchEvent(new CustomEvent(type, {detail})))
  }
}

const append = (el, text) => {
  const div = document.createElement('div')
  div.innerHTML = text
  while(div.firstChild) el.appendChild(div.firstChild)
}

const prepend = (el, text) => {
  const div = document.createElement('div')
  div.innerHTML = text
  while(div.lastChild) el.prepend(div.lastChild)
}

module.exports = {guid, el, fn, dispatch, append, prepend}
