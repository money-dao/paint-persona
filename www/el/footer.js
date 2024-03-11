const search = require('./search.js')
const data = require('../service/data.js')

const footer = (hasSearch) => `
  <footer class="page-footer">
    <div class="container">
      <div class="row">
        <div class="col m6 s12">
          <h5 class=" hide-on-small-only"><a class="white-text" href="${data`pubkey`() ? '#battle' : '#'}">Paint Persona</a></h5>
          ${hasSearch ? search() : ''}
        </div>
        <div class="col m4 offset-m2 s12">
          <h5 class="white-text hide-on-small-only">_</h5>
          <ul>
            <li><a class="grey-text text-lighten-3" href="#support">Support</a></li>
            <li><a class="grey-text text-lighten-3" href="https://www.tensor.trade/trade/solana_diamond_boys" target="_blank">Marketplace</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-copyright">
      <div class="container">
      moneydao 2024
      <a class="grey-text text-lighten-4 right" href="https://moneydao.team/" target="_blank">MoneyDAO</a>
      </div>
    </div>
  </footer>
`
module.exports = footer
