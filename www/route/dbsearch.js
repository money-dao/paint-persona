const el = require('../el/_el.js')
const event = require('../service/event.js')
const data = require('../service/data.js')
const http = require('../service/http.js')
const db = require('../service/db.js')
const w3 = require('../service/w3.js')
const splToken = require("@solana/spl-token")

const dbsearch = () => {
  const pubkey = data`pubkey`()
  if(!pubkey) return location.hash = '#'

  // const getdbhx = async () => {
  //   const dbhx = nfts.diamonds.map(d => d.address.toString())
  //   hx = {db: []}//{u,db}
  //   await db.read(`diamondbattle/history/u/${pubkey.toString()}`, res => {
  //     hx.u = res
  //     data`dbhx`(hx)
  //     if(hx.u) Object.values(hx.u).forEach(res => hxItem(res))
  //   })
  //   dbhx.forEach(async d => {
  //     const res = await db.read(`diamondbattle/history/db/${d}`, res => {
  //       if(res){
  //         hx.db.push({d, hx: res})
  //         data`dbhx`(hx)
  //         hxItem(res, d)
  //       }
  //     })
  //   })
  // }
 
  const route = el.route(
    el.battle_nav('dbsearch')
  )
  
  return el.nav(route, true, false)
}
module.exports = dbsearch
