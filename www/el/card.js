const card = (classList, inner, outer) => `
    <div class="card ${classList}">
      ${outer ? outer : ''}
      <div class="card-content row">
        ${inner}
      </div>
    </div>
`
module.exports = card
