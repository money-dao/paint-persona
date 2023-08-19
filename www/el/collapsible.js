const collapsible = (...items) => {
  setTimeout(() => {
    const elems = document.querySelectorAll('.collapsible')
    M.Collapsible.init(elems, {})
  }, 0)
  return `
    <ul class="collapsible" style="border:none!important">
      ${items.join('')}
    </ul>
  `
}
module.exports = collapsible