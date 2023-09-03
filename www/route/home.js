const mb1 = require('../asset/mb1.png')
const mb2 = require('../asset/mb2.png')
const mg1 = require('../asset/mg1.png')
const mg2 = require('../asset/mg2.png')
const el = require('../el/_el.js')
const event = require('../service/event.js')
const w3 = require('../service/w3.js')

module.exports = () => {
  location.search = ''

  const mbs = [
    {img: mb1, title: 'Solana Money Boy #1087'}
  ]
  
  const connectId = event.click(async () => {
    await w3.connect()
    document.querySelector('nav').dispatchEvent('balance')
  })

  const homeTile = (left, right) => el.row(
    el.col('s12 m8 home-tile', left),
    el.col('s12 m4 home-tile', right)
  )
  
  return el.route(
    homeTile(
      `<div class="white-text">
        <h1>Paint Persona</h1>
        <h5>A Solana Moneyboys experience</h5>
        <br>
        <button class="waves-effect waves-light btn col s12 deep-purple lighten-2" id="${connectId}">Connect</button>
        <h6 class="col s12 white-text"><ul class="browser-default">
          <li>Use Moneyboys or Moneygirls</li>
          <li>Create Posts</li>
          <li>Earn SOL for likes on your posts</li>
        </ul></h6>
      </div>`,`
      <div class="col s12">
        ${el.mb_card(mbs[0], false)}
      </div>`
    ),
    // el.footer()
  )
}