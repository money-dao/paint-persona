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

service.diamondbattler.joinQue = async (txId, userId) => {
  //check for repeating requests
  const dbs = await service.db.read(`signature/receivedDB/${txId}`)
  if(dbs) return {error: 'signature already processed'}
  console.log('Not processed (good)')
  //check that the signature sent a diamondboy
  const valid = await validateDB(txId, userId)
  if(!valid || valid.error) return valid || {error: 'Error validating diamond boy tx'}
  console.log('valid valid')
  const nftId = valid.nft.mintAddress.toString()
  const date = new Date().toDateString()
  const uri = valid.nft.uri
  await service.db.write(`signature/receivedDB/${nftId}`, {date, txId})
  await service.db.write(`diamondbattle/que/${nftId}`, {nftId, date, userId, uri})
  const res = await service.diamondbattler.checkQue()
  return {res, nftId, date}
}

const findEnemy = (item, ar) => ar.find(i => item.userId !== i.userId)

service.diamondbattler.checkQue = async () => {
  //check que
  let que = await service.db.read(`diamondbattle/que`)
  if(!que) return {msg: "No compatible battles available.", queLength: 0}
  que = Object.values(que)
  //find enemies
  let enemy, battleReady 
    = que.find(i => enemy = findEnemy(i, que))
  //init enemies
  if(battleReady && enemy){
    console.log('battle ready', battleReady, enemy)
    const players = await Promise.all([battleReady, enemy].map(async i => {
      const r = await fetch(i.uri)
      const db = await r.json()
      db.address = new sw3.PublicKey(i.nftId)
      return db
    }))
    //battle
    const battle = service.battler.battle(...players)
    let winner = battle.players[0].hp === 0 ? battleReady : enemy
    console.log('winner', winner)
    //save battle on server
    const battleId = await service.db.push(`diamondbattle/report`, battle)
    await service.db.write(`diamondbattle/history/${battleReady.nftId}/${battleId}`, {winner: winner.userId, userId: battleReady.userId, enemyId: enemy.userId})
    await service.db.write(`diamondbattle/history/${enemy.nftId}/${battleId}`, {winner: winner.userId, userId: enemy.userId, enemyId: battleReady.userId})
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

module.exports = service.diamondbattler
