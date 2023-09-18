const service = require('./service.js')
const sw3 = require('@solana/web3.js')
const Buffer = require('buffer')
service.web3 = {}

const MainNetBeta = 'https://api.mainnet-beta.solana.com'
const HeliusNet = 'https://rpc.helius.xyz/?api-key=bd706e2b-9ee8-49bf-a97e-f14764b99dcb'
const PaymentNet = 'https://api.metaplex.solana.com/'
const ToddLewisWallet = new sw3.PublicKey('24ufyLS4jMkAxoUk8pPgWnournhPVfoM2Vm5PdpVJS4r')
const PaintPersonaWallet = new sw3.PublicKey('FDgSCwGfSALw5Z8Sv98jrKH49e1jnmstZi3NFv4MBqSA')
const MoneyDAOWallet = new sw3.PublicKey('9buedT3QphNyZ9Yx2xMadQjSEAaLDdTJf1cY5ZJJJp8W')

const MainKeypair = require('../asset/tls-main.js')

// const prod = false
const prod = true

const Cost = {
  Post: 30000000,
  Like: 6000000,
  Subscribe: 300000000,
  Signup: 10000000000,
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
  : PaymentNet
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

service.web3.signup = async (txId, userId) => {
  const valid = await service.w3valid.validateSignup(txId, userId)
  if(valid.error) return valid
  const date = new Date().toDateString()
  // const signature = await send_tx(Cost.Donation, MainKeypair, MoneyDAOWallet)
  await service.db.write(`/member/${userId}`, {date})
  return {msg: 'done'}
}

service.web3.checkMembership = async userId => {
  const isMember = await service.db.read(`/member/${userId}`)
  return isMember || {error: 'Member not found'}
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
  //payment to owner
  const postOwner = await service.w3valid.getOwner(valid.post.mb.key)
  console.log(`like: sending payment to owner ${postOwner}`)
  const rewardSignature = await send_tx(Payment.Like, MainKeypair, new sw3.PublicKey(postOwner))
  console.log(`like: reward signature ${rewardSignature}`)
  await service.db.push('reward/like', rewardSignature)
  return {likes}
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

module.exports = {}