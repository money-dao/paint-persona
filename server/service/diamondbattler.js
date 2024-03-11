const service = require('./service.js')
const fetch = require('node-fetch')
const sw3 = require('@solana/web3.js')

const Cost = 6000000

service.diamondbattler = {}

const validateDB = async (txId, userId) => {
  try{
    console.log('validating')
    const valid = await service.tk.validate.validateNFT(txId, userId)
    console.log('valid', valid)
    const dbName = 'Solana Diamond Boys'
    if(valid.nft.name.substring(0, dbName.length) === dbName)
      return valid
    else 
      return {error: true, msg: 'Not a valid NFT name', name: valid.nft.name}
  } catch (msg) {
    console.log(msg)
    return {error: true, msg}
  }  
}

service.diamondbattler.hostReport = async id => {
  console.log(`loading report ${id}`)
  const report = await service.db.read(`diamondbattle/report/${id}`)
  if(report) return report
  return {error: true, msg: "report not found", id}
}

service.diamondbattler.joinQue = async (txId, userId) => {
  //check for repeating requests
  const dbs = await service.db.read(`signature/receivedDB/${txId}`)
  if(dbs) return {error: 'signature already processed'}
  //check that the signature sent a diamondboy
  const valid = await validateDB(txId, userId)
  if(!valid || valid.error) return valid || {error: 'Error validating diamond boy tx'}
  const nftId = valid.nft.mintAddress.toString()
  const date = new Date().toDateString()
  const nftRes = await fetch(valid.nft.uri)
  const data = await nftRes.json()
  console.log('data', data)
  const queObj = {
    date,
    name: data.name,
    image: data.image,
    uri: valid.nft.uri
  }
  await service.db.write(`signature/receivedDB/${txId}`, {date, nftId})
  await service.db.write(`diamondbattle/que/${userId}/${nftId}`, queObj)
  const res = await service.diamondbattler.checkQue()
  return {nftId, obj: queObj}
}

const initPlayer = (que, i) => {
  const users = Object.keys(que)
  const userId = users[i]
  const dbAr = Object.keys(que[userId])
  const nftId = dbAr[0]
  return {nftId, userId, ...que[userId][nftId]}
}

service.diamondbattler.checkQue = async () => {
  //check que
  let que = await service.db.read(`diamondbattle/que`)
  if(!que) return {msg: "No compatible battles available.", queLength: 0}
  let queLength = Object.values(que)
  if(queLength.length < 2) return {msg: "No compatible battles available.", queLength}
  //find enemies
  let battleReady = initPlayer(que, 0)
  let enemy = initPlayer(que, 1)
  //init enemies
  if(battleReady && enemy){
    console.log('battle ready', battleReady, enemy)
    const players = await Promise.all([battleReady, enemy].map(async i => {
      const r = await fetch(i.uri)
      const db = await r.json()
      db.address = new sw3.PublicKey(i.nftId)
      return db
    }))
    //sort players [battleReady, enemy]
    if(players[0].address.toString() !== battleReady.nftId) players = [
      players[1],
      players[0]
    ]
    //battle
    const battle = service.battler.battle(...players)
    let winner = battle.players[0].hp === 0 ? battleReady : enemy
    console.log('winner', winner)
    //save battle on server
    const battleId = await service.db.push(`diamondbattle/report`, battle)
    const date = (new Date()).toUTCString()

    const thumbnail = i => {
      return {
        user: {
          pubkey: i?battleReady.userId:enemy.userId,
          db: i?battleReady.nftId:enemy.nftId,
          image: battle.players[i].info.image
        },
        enemy: {
          pubkey: i?enemy.userId:battleReady.userId,
          db: i?enemy.nftId:battleReady.nftId,
          image: battle.players[i?0:1].info.image
        },
        date,
        rounds: battle.reports.length,
        winner: winner.userId
      }
    }
    
    await service.db.write(`diamondbattle/que/${battleReady.userId}/${battleReady.nftId}`, null)
    await service.db.write(`diamondbattle/que/${enemy.userId}/${enemy.nftId}`, null)
    await service.db.write(`diamondbattle/history/db/${battleReady.nftId}/${battleId}`, thumbnail(0))
    await service.db.write(`diamondbattle/history/db/${enemy.nftId}/${battleId}`, thumbnail(1))
    await service.db.write(`diamondbattle/history/u/${battleReady.userId}/${battleId}`, thumbnail(0))
    await service.db.write(`diamondbattle/history/u/${enemy.userId}/${battleId}`, thumbnail(1))
    //send dbs to winner
    console.log('sending 1/2', battleReady.nftId)
    await service.nft.sendToken(battleReady.nftId, winner.userId)
    console.log('sending 2/2', enemy.nftId)
    await service.nft.sendToken(enemy.nftId, winner.userId)
    console.log('sent')
    return {msg: "battle complete"}
  } else {
    console.log('no enemy diamond boys available', que)
    return {msg: "No compatible battles available.", queLength: que.length}
  }
}
service.diamondbattler.checkQue()

module.exports = service.diamondbattler
