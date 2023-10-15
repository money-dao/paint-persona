const el = require('../el/_el.js')
const event = require('../service/event.js')
const data = require('../service/data.js')
const db = require('../service/db.js')

module.exports = () => {

  const homeTile = (left, right) => el.row(
    el.col('s12 m7 l8 home-tile', left),
    el.col('s12 m5 l4 home-tile', right)
  )

  const loadRaffle = event.el(ele => 
    db.read('promo/raffle', async promo => {
      const pubkey = data`pubkey`()
      const profile = {
        img: promo.img,
        title: promo.title,
        nft: {address: {toString: () => promo.pubkey}}
      }
      ele.innerHTML = el.mb_card(profile, pubkey ? true : false, true)
      document.querySelector('#raffleDate').innerHTML = `Raffle ends: ${new Date(promo.date).toDateString()}`
    })
  )

  const loadTickets = event.el(async ele => { 
    const pubkey = data`pubkey`()
    if(pubkey)
      db.read(`raffle/${pubkey}/likes`, likes => 
        ele.innerHTML = `You have <b>${likes ? likes : 0} Likes</b> and <b>${Math.floor((likes ? likes : 1) / 9) + (likes?1:0)} Ticket(s)</b>`
      )
    else
      ele.innerHTML = `<a href="#">Connect to view how many raffle tickets you have</a>`
  })
  
  return el.route(
    homeTile(
      `<div class="white-text">
        <h1>Raffle</h1>
        <h5>Like posts for tickets to win a Money Boy or Money Girl.</h5>
        <p>Get 1 ticket for your first like and 1 for every 9 likes.</p>
        <p id="raffleDate"></p>
        <p id="${loadTickets}"></p>
      </div>`,`
      <div class="col s12" id="${loadRaffle}">
      </div>`
    ),
    el.footer()
  )
}