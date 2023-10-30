const card = (classList, inner, outer, action) => `
    <div class="card ${classList}">
      ${outer ? outer : ''}
      <div class="card-content row">
        ${inner}
      </div>
      ${action ? `<div class="card-action">${action}</div>` : ''}
    </div>
`
module.exports = card
