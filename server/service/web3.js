const prod = require('../../mode.js')
const service = require('./service.js')
const sw3 = require('@solana/web3.js')
const spl = require('@solana/spl-token')
const Buffer = require('buffer')
const fetch = require('node-fetch')
service.web3 = {}

const MainNetBeta = 'https://api.mainnet-beta.solana.com'
const HeliusNet = 'https://rpc.helius.xyz/?api-key=bd706e2b-9ee8-49bf-a97e-f14764b99dcb'
const PaymentNet = 'https://api.metaplex.solana.com/'
const ToddLewisWallet = new sw3.PublicKey('24ufyLS4jMkAxoUk8pPgWnournhPVfoM2Vm5PdpVJS4r')
const PaintPersonaWallet = new sw3.PublicKey('FDgSCwGfSALw5Z8Sv98jrKH49e1jnmstZi3NFv4MBqSA')
const MoneyDAOWallet = new sw3.PublicKey('9buedT3QphNyZ9Yx2xMadQjSEAaLDdTJf1cY5ZJJJp8W')

const MainKeypair = require('../asset/tls-main.js')

const Cost = {
  Post: 30000000,
  Like: 6000000,
  DiamondBattle: 6000000,
  Subscribe: 300000000,
  Signup: 1000000000,
  // Donation: 2500000000
}

const Payment = {
  Like: 5000000,
  Subscribe: 270000000
}

const solConnection = () => new sw3.Connection( prod
  ? HeliusNet
  : MainNetBeta
)

const ownerNet = () => new sw3.Connection( prod
  ? HeliusNet
  : PaymentNet,
  "confirmed"
)

const send_tx = async (amount, fromKeypair, toPubkey) => {
  const connection = ownerNet()
  const lamports = amount
  console.log(lamports)
  const transaction = new sw3.Transaction().add(
    sw3.SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey,
      lamports
    })
  )
  let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
  transaction.recentBlockhash = blockhash
  transaction.feePayer = fromKeypair.publicKey

  // Sign transaction, broadcast, and confirm
  const signature = await sw3.sendAndConfirmTransaction(connection, transaction, [fromKeypair])
  console.log('signature', signature)
  const status =  await connection.getSignatureStatus(signature)
  console.log('status', status)
  return signature
}

const send_nft = async (mintPubkey, to) => {
  const connection = ownerNet()
  mintPubkey = new sw3.PublicKey(mintPubkey)
  to = new sw3.PublicKey(to)
  console.log(mintPubkey, to)
  let senderATA = await spl.getAssociatedTokenAddress(mintPubkey, PaintPersonaWallet)
  console.log('sender', senderATA)
  try {
    recieverATA = await spl.createAssociatedTokenAccount(
      connection, // connection
      MainKeypair, // fee payer
      mintPubkey, // mint
      to // owner,
    )
  } catch(createTAError) {
    try {
      recieverATA = await spl.getAssociatedTokenAddress(mintPubkey, to)  
    } catch(getTAError) {
      console.error('Error sending NFT')
      console.error(createTAError)
      console.error(getTAError)
      return null
    }
  }
  console.log('reciever', recieverATA)
  const txhash = await spl.transferChecked(
    connection, // connection
    MainKeypair, // payer
    senderATA, // from (should be a token account)
    mintPubkey, // mint
    recieverATA, // to (should be a token account)
    MainKeypair, // from's owner
    1, // amount, if your deciamls is 8, send 10^8 for 1 token
    0 // decimals
  )
  console.log('nft sent')
  return txhash
}

service.web3.signup = async (txId, userId) => {
  const valid = await service.w3valid.validateSignup(txId, userId)
  if(valid.error) return valid
  const date = new Date().toDateString()
  // const signature = await send_tx(Cost.Donation, MainKeypair, MoneyDAOWallet)
  await service.db.write(`/member/${userId}`, {date})
  return {msg: 'done'}
}

service.web3.post = async (txId, post) => {
  const valid = await service.w3valid.validatePost(txId, post)
  if(valid.error) return valid  
  console.log(`post [${post.mb.key}]`)
  const postMeta = service.db.pushThen(`/post`, post)
  post.id = postMeta.key
  postMeta.resolve()
  service.db.push(`/profile/${post.mb.key}/post`, post.id)
  let postCount = await service.db.read(`/profile/${post.mb.key}/info/posts`)
  postCount = postCount || 0
  postCount++
  service.db.write(`/profile/${post.mb.key}/info/posts`, postCount)
  return {msg: 'done'}
}

service.web3.loadProfilePosts = async (userPubkey, mbPubkey) => {
  console.log('load profile', mbPubkey)
  const isOwner = await service.w3valid.validateOwnership(userPubkey, mbPubkey)
  console.log('owner', isOwner)
  const posts = await service.db.limit( `/profile/${mbPubkey}/post`, isOwner ? 10 : 3 )
  if(!posts) return []
  const postsAr = Object.values(posts)
  const loadedPosts = await Promise.all(postsAr.map(async postId => service.db.read(`/post/${postId}`)))
  return loadedPosts
}

const r = val => parseFloat(val.toFixed(3))

service.web3.loadRevenue = async (mbAr) => {
  let res = {}
  await Promise.all(mbAr.map(async mb => {
    let likes = await service.db.read(`/profile/${mb}/info/likes`)
    likes ? likes = r(parseInt(likes) * 0.005) : likes = 0
    let posts = await service.db.read(`/profile/${mb}/info/posts`)
    posts ? posts = r(parseInt(posts) * 0.03) : posts = 0
    const total = r((0 - posts) + likes)
    res[mb] = {likes, posts, total}
    return mb
  }))
  return res
}

service.web3.like = async (txId, postId, userId) => {
  //validate
  const valid = await service.w3valid.validateLike(txId, postId, userId)
  console.log('like', valid)
  if(!valid) return {error: 'Not valid.'}
  if(valid.error) return valid
  console.log(`like: post liked ${postId}`)
  //like
  let likes = await service.db.read(`/post/${postId}/likes`)
  likes = likes || 0
  likes++
  const profileKey = await service.db.read(`/post/${postId}/mb/key`)
  let profileLikes = await service.db.read(`/profile/${profileKey}/info/likes`)
  profileLikes = profileLikes || 0
  profileLikes++
  console.log(valid)
  await service.db.write(`/post/${postId}/likes`, likes)
  await service.db.write(`/profile/${profileKey}/info/likes`, profileLikes)
  await service.db.write(`/signature/like/${txId}`, postId)
  //raffle
  let raffleLikeCount = await service.db.read(`/raffle/${userId}/likes`)
  raffleLikeCount = raffleLikeCount || 0
  raffleLikeCount++
  await service.db.write(`/raffle/${userId}/likes`, raffleLikeCount)
  //payment to owner
  const postOwner = await service.w3valid.getOwner(valid.post.mb.key)
  console.log(`like: sending payment to owner ${postOwner}`)
  const rewardSignature = await send_tx(Payment.Like, MainKeypair, new sw3.PublicKey(postOwner))
  console.log(`like: reward signature ${rewardSignature}`)
  await service.db.push('reward/like', rewardSignature)
  return {likes, raffleLikeCount}
}

let posts = {}, postsByLikes = []
const loadPosts = async () => {
  let resPosts = await service.db.order(`post`, 'likes')
  if(!resPosts) return []
  posts = resPosts
  const resAr = Object.values(posts)
  const l = a => a.likes ? a.likes : 0
  postsByLikes = resAr.sort((a, b) => {
    if(l(a) > l(b)) return -1
    if(l(a) < l(b)) return 1
    return 0
  })
}

service.web3.browse = async (page) => {
  const amount = 4
  const start = parseInt(page) * amount
  const end = start + amount
  await loadPosts()
  const res = postsByLikes.slice(start, end)
  return res
}

const fromlist = ar => ar[Math.floor(ar.length * Math.random())]

service.web3.checkRaffle = async () => {
  let rafflePromo = await service.db.read(`/promo/raffle`)
  if(!rafflePromo) {
    console.log('New Raffle Prize')
    const inv = await service.w3valid.moneyboy_balance(PaintPersonaWallet)
    const rafflePool = [...inv.boys, ...inv.girls]
    if(rafflePool.length === 0) return console.log('NO MONEY BOYS OR MONEY GIRLS FOR RAFFLE!')
    console.log(rafflePool.length)
    rafflePromo = fromlist(rafflePool)
    console.log(rafflePromo)
    const date = new Date();
    date.setDate(date.getDate() + 2 * 7);
    rafflePromo = {
      date: date.toString(),
      img: rafflePromo.image,
      title: rafflePromo.name,
      pubkey: rafflePromo.address.toString()
    }
    await service.db.write(`/promo/raffle`, rafflePromo)
    console.log('Raffle Prize Saved:', rafflePromo)
  }
  if(new Date(rafflePromo.date) <= new Date()){
    await service.web3.raffle()
    return service.web3.checkRaffle()
  } else
    console.log('raffle not ready yet')
  
  return rafflePromo
}
// service.web3.checkRaffle()
// setInterval(() => service.web3.checkRaffle(), 1000 * 60 * 60 * 6) //check four times daily

service.web3.raffle = async () => {
  let raffle = await service.db.read(`/raffle`)
  let users = Object.keys(raffle || {})
  let tickets = []
  users.forEach(userId => {
    const count = raffle[userId].likes
    const ticketsAmt = Math.floor(count / 9)
    for (let i = 0; i < ticketsAmt + 1; i++) tickets.push(userId)
  })
  const winner = fromlist(users)
  console.log('winner', winner)
  let rafflePromo = await service.db.read(`/promo/raffle`)
  console.log('rafflePromo', rafflePromo)
  const sig = await send_nft(rafflePromo.pubkey, winner)
  await service.db.push(`/reward/raffle`, sig)
  await service.db.write(`/promo/raffle`, null)
  await service.db.write(`/raffle`, null)
  return {winner}
}
// console.log(service.web3.raffle())

service.web3.joinDiamondBattleQue = async (txId, userId) => {
  //check for repeating requests
  const dbs = await service.db.read(`signature/receivedDB/${txId}`)
  if(dbs) return {error: 'signature already processed'}
  //check that the signature sent a diamondboy
  const valid = await service.w3valid.validateDiamondBoy(txId, userId)
  if(!valid) return {error: 'Error validating diamond boy tx'}
  const nftId = valid.nft.mintAddress.toString()
  const date = new Date().toDateString()
  const uri = valid.nft.uri
  await service.db.write(`signature/receivedDB/${nftId}`, {date, txId})
  await service.db.write(`diamondbattle/que/${nftId}`, {nftId, date, userId, uri})
  const res = await service.web3.checkDiamondBattleQue()
  return {res, nftId, date}
}

const findEnemy = (item, ar) => ar.find(i => item.userId !== i.userId)

service.web3.checkDiamondBattleQue = async () => {
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
    return {msg: "battle complete"}
  } else {
    console.log('no enemy diamond boys available', que)
    return {msg: "No compatible battles available.", queLength: que.length}
  }
}

// service.web3.joinDiamondBattleQue(
  // "gGiJjPWoCydS4g1CWuaAxnpvCJMfHtqbhwRByEjkXZ34uMLx2uTyWE6XwGog8jfntMfEJ6FCqzZh3c9RqRei8L8", 
  // "24ufyLS4jMkAxoUk8pPgWnournhPVfoM2Vm5PdpVJS4r"
// )
// service.web3.joinDiamondBattleQue(
  // "4GsGfhJVVqcEBCXDEC6v6a3zhaqTeorfZm6LK47wC3frjdyHpNpphAKNTB6U2guhL6ZuvJgfT3mdoPSvHkJCZEhT",
  // "2BLHWKuts7Nn5cRr1NYtCd8DV644RomkFVfKg5RPx4nP"
// )
service.web3.checkDiamondBattleQue()

module.exports = {}