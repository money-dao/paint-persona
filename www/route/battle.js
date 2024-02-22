const el = require('../el/_el.js')
const event = require('../service/event.js')
const data = require('../service/data.js')
const http = require('../service/http.js')
const w3 = require('../service/w3.js')
const battler = require('../service/diamondbattler.js')
const splToken = require("@solana/spl-token")

const battle = () => {
  const pubkey = data`pubkey`()
  if(!pubkey) return location.hash = '#'

  const nfts = data`nfts`()

  const refresh = async () => {
    if(nfts){
      console.log('battle nfts', nfts)
      window.battler = battler
      window.testBattle = () => battler.battle(nfts.diamonds[0], nfts.diamonds[1])
    }
  }
  event.fn(refresh)

  let test = []

  const dbcard = db => {
    const stats = battler.toStats(db)
    const statsTab = event.guid()
    const traitsTab = event.guid()

    const traitsId = event.click(el => {
      document.querySelector(`#${statsTab}`).classList.add('hide')
      document.querySelector(`#${traitsTab}`).classList.remove('hide')
    })
    const statsId = event.click(el => {
      document.querySelector(`#${statsTab}`).classList.remove('hide')
      document.querySelector(`#${traitsTab}`).classList.add('hide')
    })

    const battleId = event.click(el => {
      // test.push(db)
      // if(test.length === 2) {
      //   const report = battler.battle(...test)
      //   test = []      
      //   data`watch`(report)
      //   location.hash = '#watch'
      // }
      event.append(document.body, confirmBattleModal(db))
      event.fn(() => event.dispatch`modal`('#confirmbattle', {on: true}))
    })
    
    return el.card('horizontal',
      `<ul id="${statsTab}">
        <li>Hp: ${stats.hp}</li>
        <li>Speed: ${stats.speed}</li>
        <li>Protection: ${stats.protection.map(n => `1d${n}`).join(', ')}</li>
        ${stats.abilities.map(a => 
          `<li>${a.name}: 1d${a.dice} Damage</li>`
        ).join('')}
        <li><button id="${traitsId}" class="waves-effect waves-light btn col s12 deep-purple lighten-2">Traits</button></li>
        <li><button id="${battleId}" data-target="confirmbattle" class="waves-effect waves-light modal-trigger btn col s12 deep-purple lighten-2">Battle</button></li>
      </ul>
      <ul id="${traitsTab}" class="hide">
        ${db.attributes.map(attr => `
          <li>
            <div>${attr.trait_type}: <b>${attr.value}</b></div>
            <div class="right-align">${battler.traits[attr.trait_type][attr.value].desc}</div>
          </li>
        `).join('')}
        <li><button id="${statsId}" class="waves-effect waves-light btn col s12 deep-purple lighten-3">Stats</button></li>
      </ul>
      `,
      `<div class="card-image">
        <img src="${db.image}" class="responsive-img">
        <span class="card-title">#${db.edition}</span>
      </div>`
    )
  }

  const confirmBattleModal = db => {
    const playId = event.click(async () => {
      //tx - nft, 0.003 SOL
      let signature
      try {
        signature = await w3.nft_tx(db.address, w3.Cost.DiamondBattle)
        console.log('signature', signature)
        
        const res = await http.post('joinQue', {
          txId: signature.signature,
          userId: pubkey.toString()
        })
        console.log('res', res)
      } catch (err) {
        console.error(err)
        return null
      }
    })
    const closeId = event.click(() => {
      event.dispatch`modal`(`#confirmbattle`, {on: false})
      const modal = document.querySelector(`#confirmbattle`)
      modal.parentElement.removeChild(modal)
    })
    const initId = event.el(async el => {
      const ata = await w3.ppATA(db.address)
      const res = await w3.check_nft_account(ata)
      console.log(res)
      if(!res) {
        el.innerText = "Your diamond boy has never battled before. There will be an initiation fee that covers the cost of creating an nft account for the server (around 0.002 SOL)."
        event.fn(() => {
          document.querySelector(`#${playId}`).innerHTML = `Initialize`
        })
      }
    })
    return el.modal('confirmbattle', `
      <h4>Confirm sending ${db.name}</h4>
      <img src="${db.image}" width="180">
      <p>Once sent, your diamond boy will be in que to battle a diamond boy of a different sending wallet.</p>
      <p>If your diamond boy wins, your diamond boy and the defeated diamond boy will be sent your wallet.</p>
      <p>If your diamond boy loses, it will be sent to the winner's wallet.</p>
      <p>If your diamond boy does not battle within 48 hours, you will be able to retrieve your diamond boy from the server.</p>
      <p id="${initId}"></p>
    `, `
      <button class="waves-effect waves-light btn" id="${closeId}">Close</button>    
      <button class="waves-effect waves-light black btn" id="${playId}">Play ${el.cost(w3.Cost.DiamondBattle * 0.001, 18)}</button>    
    `)
  }
  
  const selectedDBId = event.el(el => {
    el.addEventListener('dbselect', e => 
      el.innerHTML = dbcard(e.detail)
    )

    if(nfts.diamonds) el.innerHTML = dbcard(nfts.diamonds[0])
  })
  
  const route = el.route(
    el.row(`
      <div class="center">
        <button class="waves-effect waves-light btn disabled">Battle</button>
        <button class="waves-effect waves-light btn">History</button>
        <button class="waves-effect waves-light btn">Search</button>
      </div>
    `),
    el.row(
      `<div id="${selectedDBId}"></div>`
    ),
    el.row(
      `<div class="center">`
      + nfts.diamonds.map(db => {
        const selectId = event.click(() => event.dispatch`dbselect`(`#${selectedDBId}`, db))
        return `<button id="${selectId}" class="waves-effect waves-light btn-flat" style="height: 90px"><img src="${db.image}" width="90"></button>`
      }).join('') +
      `</div>`
    ),
  )
  
  return el.nav(route, true, false)
}
module.exports = battle
