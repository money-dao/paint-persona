const el = require('../el/_el.js')
const event = require('../service/event.js')
const data = require('../service/data.js')
const http = require('../service/http.js')
const db = require('../service/db.js')
const w3 = require('../service/w3.js')
const splToken = require("@solana/spl-token")

const dbhx = () => {
  const pubkey = data`pubkey`()
  if(!pubkey) return location.hash = '#'

  const nfts = data`nfts`()
  let hx = data`dbhx`()
  let que = data`que`()
  console.log('data hx', hx)

  const queIcon = (img, size) => `<img width="${size ? size+'' : '32'}px" class="circle z-depth-2" src=${img}>`

  //que

  console.log('que', que)
  const queItem = (db, item) => el.card('col card-thin', `
    <div class="center">
      ${queIcon(item.image, 124)}
    </div>
    <h5 class="center">${item.name.substring(item.name.length - 5)}</h5>
    <div class="center">${item.date}</div>
    <div class="center">
      <button class="btn red col s12">Leave</button>
    </div>
  `)
  
  //hx

  const collapseId = (id, ...items) => {
    const html = el.collapsible(...items)
    const index = html.indexOf('<ul') + 3
    return html.substring(0, index) + ` id="${id}"` + html.substring(index)
  }

  const hxIcon = (img, size) => `<img width="${size ? size+'' : '32'}px" class="circle" style="margin-right: 9px" src=${img}>`

  const hxItem = (res, watchId, dbId) => {
    console.log(res, dbId)
    const mine = dbId ? (res.user.db === dbId ? res.user : res.enemy) : (res.user.pubkey === pubkey.toString() ? res.user : res.enemy)
    console.log('mine', mine, dbId)
    const name = mine.db.substring(0, 5)
    const img = mine.image
    const winner = res.winner === res.user.pubkey ? res.user : res.enemy
    const defeated = res.winner === res.user.pubkey ? res.enemy: res.user
    const item = el.collapse_li(
      `<b class="flex v-center">${hxIcon(img)}${name} - ${!dbId ? (winner.pubkey === pubkey.toString() ? ' Victory' : ' Defeat') : (winner.db === dbId ? ' Victory' : ' Defeat')}</b>`,
      `
      ${el.card('',
        el.row(
          el.col('s12', `<h3 class="flex v-center">${hxIcon(winner.image)} Victor</h3>`),
          el.col('s12', `user <a href="https://solscan.io/address/${winner.pubkey}" target="_blank">${winner.pubkey}</a>`),
          el.col('s12', `db <a href="https://solscan.io/token/${winner.db}" target="_blank">${winner.db}</a>`),
        )
      )}
      ${el.card('',
        el.row(
          el.col('s12', `<h3 class="flex v-center">${hxIcon(defeated.image)} Defeated</h3>`),
          el.col('s12', `user <a href="https://solscan.io/address/${defeated.pubkey}" target="_blank">${defeated.pubkey}</a>`),
          el.col('s12', `db <a href="https://solscan.io/token/${defeated.db}" target="_blank">${defeated.db}</a>`),
        )
      )}
      ${el.card('',
        el.row(
          el.col('s12', `<b>${res.rounds} rounds</b>`),
          el.col('s12', `${res.date}`),
          el.col('s12', `<a href="?id=${watchId}#watch">Replay</a>`)
        )
      )}
      `
    )

    event.fn(() => {
      const el = document.querySelector(dbId ? '#db' : '#u')
      event.prepend(el, item)
    })
  }

  const getdbhx = async () => {
    const dbhx = nfts.diamonds.map(d => d.address.toString())
    hx = {db: []}//{u,db}
    await db.read(`diamondbattle/history/u/${pubkey.toString()}`, res => {
      hx.u = res
      data`dbhx`(hx)
      if(hx.u) Object.keys(hx.u).forEach(watchId => hxItem(res[watchId], watchId))
    })
    dbhx.forEach(async d => {
      const res = await db.read(`diamondbattle/history/db/${d}`, res => {
        if(res){
          console.log('loaded db', d, res)
          Object.keys(res).forEach(watchId => {
            const db = res[watchId]
            hxItem(db, watchId, d)
            hx.db.push({db, d, watchId})
          })
          data`dbhx`(hx)
        }
      })
    })
  }

  const drawdbhx = () => {
    if(hx.u) Object.keys(hx.u).forEach(watchId => hxItem(hx.u[watchId], watchId))
    hx.db.forEach(d => hxItem(d.db, d.watchId, d.d))
  }
  if(!hx) getdbhx()
  else drawdbhx()
  
  const route = el.route(
    el.battle_nav('dbhx'),
    '<h3 class="white-text">Que</h3>',
    el.row(
      ...(que ? Object.keys(que).map(db => queItem(db, que[db])) : [''])
    ),
    '<h3 class="white-text">User History</h3>',
    collapseId('u'),
    '<h3 class="white-text">Diamond History</h3>',
    collapseId('db')
  )
  
  return el.nav(route, true, false)
}
module.exports = dbhx
