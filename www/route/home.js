const mb1 = require('../asset/mb1.png')
const mb2 = require('../asset/mb2.png')
const mg1 = require('../asset/mg1.png')
const mg2 = require('../asset/mg2.png')
const el = require('../el/_el.js')
const event = require('../service/event.js')
const w3 = require('../service/w3.js')

module.exports = () => {
  location.search = ''

  const front_pagers = [
    {img: mb1, title: 'Solana Money Boy #1087'},
    {img: mg1, title: 'Solana Money Girl #2162'},
    {img: mb2, title: 'Solana Money Boy #621'},
    {img: mg2, title: 'Solana Money Girl #428'}
  ]
  
  return el.nav(
    el.route(
      `
      <div class="row center">
        <h1 class="header white-text">Paint Persona</h1>
        <h4 class="light white-text">Social media where your NFT is your account</h4>
      </div>
      `,
      el.row(
        `<div class="deep-purple lighten-4">`,
          el.collapible(
            el.collapse_li('Browse', 'View posts as your moneyboy / moneygirl. Each NFT is its own account.'),
            el.collapse_li('Post', 'In depth post editor makes posts fun.'),
            el.collapse_li('Profile', 'Create an engaging profile page for your NFT.'),
            el.collapse_li('Money', 'Because your NFT is the account, when you sell your NFT you are also selling an account.')
          ),
        `</div>`
      ),
      el.row(
        el.card('blue lighten-3', 
          front_pagers.map(mb => el.col('s6 m3', el.mb_card(mb, false))).join('')
        )
      ),
      el.row(
        el.search()
      ),
      el.footer()
    )
  )
}