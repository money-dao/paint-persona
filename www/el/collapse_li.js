const collapse_li = (header, body, icon) => `
  <li>
    <div class="collapsible-header deep-purple white-text" style="border: none!important">${icon ? `<i class="material-icons">${icon}</i>` : ''}${header}</div>
    <div class="collapsible-body"><span>${body}</span></div>
  </li>
`
module.exports = collapse_li