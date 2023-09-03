const mb1 = require('../asset/mb1.png')
const mb2 = require('../asset/mb2.png')
const mg1 = require('../asset/mg1.png')
const mg2 = require('../asset/mg2.png')
const el = require('../el/_el.js')
const http = require('../service/http.js')

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
      el.row(
        el.card('blue lighten-3', 
          front_pagers.map(mb => el.col('s12 m3', el.mb_card(mb, false))).join('')
        )
      ),
      el.row(
        `<div class="deep-purple lighten-4">`,
          el.collapible(
            el.collapse_li('Browse', 'View and like posts as a moneyboy or moneygirl.'),
            el.collapse_li('Post', `Spend ${el.cost('0.03', 18)} to make a post.`),
            el.collapse_li('Earn', `Earn ${el.cost('0.005', 18)} for each like on a post created by a mb or mg you own.`)
          ),
        `</div>`
      ),
      el.footer()
    )
  )
}