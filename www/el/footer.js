const search = require('./search.js')

const footer = (hasSearch) => `
  <footer class="page-footer">
    <div class="container">
      <div class="row">
        <div class="col m6 s12">
          <h5><a class="white-text" href="#">Paint Persona</a></h5>
          ${hasSearch 
            ? search() 
            : '<p>Signin to search profiles.</p>'
          }
        </div>
        <div class="col m4 offset-m2 s12">
          <h5 class="white-text">Links</h5>
          <ul>
            <li><a class="grey-text text-lighten-3" href="#support">Customer Support</a></li>
            <li><a class="grey-text text-lighten-3" href="https://www.tensor.trade/trade/solana_money_boys" target="_blank">Get Moneyboys</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-copyright">
      <div class="container">
      Todd Lewis Studio © 2023 Copyright
      <a class="grey-text text-lighten-4 right" href="https://moneydao.team/" target="_blank">MoneyDAO</a>
      </div>
    </div>
  </footer>
`
module.exports = footer