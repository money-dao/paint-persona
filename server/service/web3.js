const service = require('./service.js')
const sw3 = require('@solana/web3.js')
const Buffer = require('buffer')
const { Metaplex, findMetadataPda, keypairIdentity, bundlrStorage } = require("@metaplex-foundation/js")
const { GetProgramAccountsFilter, Keypair, Transaction, Connection, PublicKey } = require("@solana/web3.js")
const { AccountLayout, TOKEN_PROGRAM_ID, createTransferCheckedInstruction, getAssociatedTokenAddress} = require("@solana/spl-token")
service.web3 = {}

const MainNetBeta = 'https://api.mainnet-beta.solana.com'
const PaymentNet = 'https://api.metaplex.solana.com/'
const ToddLewisWallet = new sw3.PublicKey('24ufyLS4jMkAxoUk8pPgWnournhPVfoM2Vm5PdpVJS4r')
const PaintPersonaWallet = new sw3.PublicKey('FDgSCwGfSALw5Z8Sv98jrKH49e1jnmstZi3NFv4MBqSA')

const MainKeypair = require('../asset/tls-main.js')
console.log('main', MainKeypair.publicKey.toString())


const Cost = {
  Post: 30000000,
  Like: 6000000,
  Subscribe: 300000000
}

const Payment = {
  Like: 5000000,
  Subscribe: 270000000
}

const validateSignatureCompletion = async (table, signature) => {
  const status = await service.db.read(`/signature/${table}/${signature}`)
  if(status) return {error: 'Signature tx already completed.'}
  return {}
}

const validateOwnership = async (userPubkey, mbPubkey) => {
  //validate user owns mb
  const mbs = await moneyboy_balance(new sw3.PublicKey(userPubkey))
  const isOwned = [...mbs.boys, ...mbs.girls].find(obj => obj.address.toString() === mbPubkey)
  return isOwned
}

const validateSignatureOnWallet = async (signature, wallet) => {
  const connection = new sw3.Connection(MainNetBeta)
  const user = new sw3.PublicKey(wallet)
  const signaturesForAddress = await connection.getSignaturesForAddress(user)
  if(!signaturesForAddress || signaturesForAddress.length === 0) return {error: `No signatures found for ${wallet}`}
  const valid = signaturesForAddress.find(signatureObj => {
    if(signatureObj.signature === signature && signatureObj.confirmationStatus === 'finalized')
      return signatureObj
  })
  
  return valid || {error: `Signature not found (${signature}) on wallet (${wallet})`}
}

const transactionDetails = async (signature) => {
  const connection = new sw3.Connection(MainNetBeta)
  const res = await connection.getParsedTransaction(signature)
  return res
}

const validateTx = async (txId, userPubkey) => {
  //validate pubkey sent finished tx
  console.log('validate', userPubkey, PaintPersonaWallet.toString())
  const userValid = await validateSignatureOnWallet(txId, userPubkey)
  if(userValid.error) return userValid
  const tlValid = await validateSignatureOnWallet(txId, PaintPersonaWallet.toString())
  if(tlValid.error) return tlValid
  const details = await transactionDetails(txId)

  const senderAmount = details.meta.postBalances[0] - details.meta.preBalances[0]
  const receiverAmount = details.meta.postBalances[1] - details.meta.preBalances[1]
  
  return {sent: receiverAmount}
}

const moneyboy_balance = async (pubkey) => {
  const connection = new sw3.Connection(PaymentNet)
  const wallet = pubkey

  const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(wallet))
      .use(bundlrStorage())
  
  const tokenAccounts = await connection.getTokenAccountsByOwner(
      wallet, {programId: TOKEN_PROGRAM_ID}
  )
  let mints = []
  tokenAccounts.value.forEach(tokenAccount => {
    const accountData = AccountLayout.decode(tokenAccount.account.data);
    if(accountData.amount == 1){
      const mintAddress = new sw3.PublicKey(accountData.mint)
      mints.push(mintAddress)
    }
  })
  const nfts = await metaplex.nfts().findAllByMintList({ mints })
  let money = {
    boys: [],
    girls: [],
    diamonds: [],
    mansions: []
  }
  let moneyNfts = []
  nfts.forEach(nft => {
    if (nft.name.substring(0,16) == 'Solana Money Boy'
    || nft.name.substring(0,17) == 'Solana Money Girl'
    || nft.name.substring(0,18) == 'Solana Diamond Boy'
    || nft.name.substring(0,12) == 'MoneyMansion')
    moneyNfts.push(nft)
  })
  await Promise.all(moneyNfts.map(async nft => {
    const meta = await fetch(nft.uri)
    const json = await meta.json()
    json.address = nft.mintAddress
    if (nft.name.substring(0,16) == 'Solana Money Boy')
      money.boys.push(json)
    else if (nft.name.substring(0,17) == 'Solana Money Girl')
      money.girls.push(json)
    else if (nft.name.substring(0,18) == 'Solana Diamond Boy')
      money.diamonds.push(json)
    else if (nft.name.substring(0,12) == 'MoneyMansion')
      money.mansions.push(json)
    return json
  }))
 
  return money
}

const validatePost = async (txId, post) => {
  let valid = true
  //validate pubkey owns mbkey
  valid = await validateOwnership(post.creator, post.mb.key)
  if(!valid) return {error: 'Error: Post creator is not the owner of mb'}
  //validate pubkey sent post cost
  valid = await validateTx(txId, post.creator)
  if(!valid) return {error: 'Error: Failed to validate tx'}
  if(valid.error) return valid
  if(valid.sent !== Cost.Post) return {error: 'Error: Amount is incorrect'}
  //validate post has 9 swag
  if(post.swag) {
    if(post.swag.length > 9) return {error: 'Error: Post has too much swag'}
    //validate swag text length
    let er = post.swag.find(swag => {
      if(swag.type === 'text')
        if(swag.value.length > 200) return {error: 'Error: Text swag has too much text'}
    })
    if(er) return er
  }
  return valid
}

const validateLike = async (txId, postId, userId) => {
  let valid = true
  //validate this signature hasn't been processed before
  const status = await validateSignatureCompletion('like', txId)
  if(status.error) return status
  //get post
  const post = await service.db.read(`/post/${postId}`)
  //validate pubkey owns mbkey
  valid = await validateOwnership(post.creator, post.mb.key)
  if(!valid) return {error: 'Error: Post creator is not the owner of mb'}
  //validate pubkey sent post cost
  valid = await validateTx(txId, userId)
  if(!valid) return {error: 'Error: Failed to validate tx'}
  if(valid.error) return valid
  if(valid.sent !== Cost.Like) return {error: 'Error: Amount is incorrect'}
  return {post}
}

const validateSubscription = async (txId, mbPubkey) => {
  const valid = true
  //get post
  const post = await service.db.read(`/post/${postId}`)
  //validate pubkey owns mbkey
  valid = await validateOwnership(post.creator, post.mb.key)
  if(!valid) return {error: 'Error: Post creator is not the owner of mb'}
  //validate pubkey sent post cost
  valid = await validateTx(txId, post.creator)
  if(!valid) return {error: 'Error: Failed to validate tx'}
  if(valid.error) return valid
  if(valid.sent !== Cost.Like) return {error: 'Error: Amount is incorrect'}
  return valid
}

const getOwner = async tokenPubkey => {
  const connection = new sw3.Connection(PaymentNet)
  const data = await connection.getTokenLargestAccounts(new sw3.PublicKey(tokenPubkey))
  const ownerTokenKey = data.value[0].address
  const parsedData = await connection.getParsedAccountInfo(ownerTokenKey)
  const owner = parsedData.value.data.parsed.info.owner
  return owner
}

const send_tx = async (amount, fromKeypair, toPubkey) => {
  const connection = new Connection(PaymentNet)
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

service.web3.post = async (txId, post) => {
  const valid = validatePost(txId, post)
  if(valid){
    console.log(`post [${post.mb.key}]`)
    const postMeta = service.db.pushThen(`/post`, post)
    post.id = postMeta.key
    postMeta.resolve()
    service.db.push(`/profile/${post.mb.key}/post`, post.id)
    return {msg: 'done'}
  }
  return {error: valid}
}

service.web3.loadProfilePosts = async (userPubkey, mbPubkey) => {
  console.log('load profile', mbPubkey)
  const wallet = new sw3.PublicKey(userPubkey)
  const isOwner = await validateOwnership(wallet, mbPubkey)
  const posts = await service.db.limit( `/profile/${mbPubkey}/post`, isOwner ? 10 : 3 )
  if(!posts) return []
  const postsAr = Object.values(posts)
  const loadedPosts = await Promise.all(postsAr.map(async postId => service.db.read(`/post/${postId}`)))
  return loadedPosts
}

service.web3.like = async (txId, postId, userId) => {
  //validate
  const valid = await validateLike(txId, postId, userId)
  console.log('like', valid)
  if(!valid) return {error: 'Not valid.'}
  if(valid.error) return valid
  console.log(`like: post liked ${postId}`)
  //like
  let likes = await service.db.read(`/post/${postId}/likes`)
  likes = likes || 0
  likes++
  console.log(valid)
  await service.db.write(`/post/${postId}/likes`, likes)
  await service.db.write(`/signature/like/${txId}`, postId)
  //payment to owner
  const postOwner = await getOwner(valid.post.mb.key)
  console.log(`like: sending payment to owner ${postOwner}`)
  const rewardSignature = await send_tx(Payment.Like, MainKeypair, new sw3.PublicKey(postOwner))
  console.log(`like: reward signature ${rewardSignature}`)
  await service.db.push('reward/like', rewardSignature)
  return {likes}
}
service.web3.like('2AyJtwCZDGMYurxNG2Dm9jierqHFtCpp2yrx9sMcRywfXpxpC1mQXoQDnKhhpmjM1F2CDyEfHizAap9HQ5LNLZkW', '-NcnyaPZEQ6w7okvojRp', '2BLHWKuts7Nn5cRr1NYtCd8DV644RomkFVfKg5RPx4nP')

service.web3.subscribe = async (txId, postId, userPubkey, mbPubkey) => {
  const valid = validateSubscription(txId, mbPubkey)
  const postMBPubkey = await service.db.read(`/post/${postId}/mb/key`)
  const fortnight = new Date(Date.now() + 12096e5).toDateString()
  const subscriber = {
    fortnight,
    txId,
    user: userPubkey
  }
  service.db.push(`/profile/${postMBPubkey}/subscribers`, subscriber)
  return {msg: 'done'}
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