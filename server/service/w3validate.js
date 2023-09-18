const service = require('./service.js')
const sw3 = require('@solana/web3.js')
const Buffer = require('buffer')
const fetch = require('node-fetch')
const { Metaplex, findMetadataPda, keypairIdentity, bundlrStorage } = require("@metaplex-foundation/js")
const { AccountLayout, TOKEN_PROGRAM_ID} = require("@solana/spl-token")

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

service.w3valid = {}

service.w3valid.validateSignatureCompletion = async (table, signature) => {
  const status = await service.db.read(`/signature/${table}/${signature}`)
  if(status) return {error: 'Signature tx already completed.'}
  return {}
}

service.w3valid.validateOwnership = async (userPubkey, mbPubkey) => {
  //validate user owns mb
  const mbs = await service.w3valid.moneyboy_balance(new sw3.PublicKey(userPubkey))
  const isOwned = [...mbs.boys, ...mbs.girls].find(obj => obj.address.toString() === mbPubkey)
  return isOwned
}

service.w3valid.validateSignatureOnWallet = async (signature, wallet) => {
  const connection = solConnection()
  const user = new sw3.PublicKey(wallet)
  const signaturesForAddress = await connection.getSignaturesForAddress(user, {limit: 20})
  if(!signaturesForAddress || signaturesForAddress.length === 0) return {error: `No signatures found for ${wallet}`}
  const valid = signaturesForAddress.find(signatureObj => {
    if(signatureObj.signature === signature && signatureObj.confirmationStatus === 'finalized')
      return signatureObj
  })

  if(valid) return valid 
  return {error: `Signature not found (${signature}) on wallet (${wallet})`}
}

service.w3valid.transactionDetails = async (signature) => {
  const connection = solConnection()
  const res = await connection.getParsedTransaction(signature)
  return res
}

service.w3valid.validateTx = async (txId, userPubkey) => {
  //validate pubkey sent finished tx
  console.log('validate', userPubkey, PaintPersonaWallet.toString())
  const userValid = await service.w3valid.validateSignatureOnWallet(txId, userPubkey)
  if(userValid.error) return userValid
  const tlValid = await service.w3valid.validateSignatureOnWallet(txId, PaintPersonaWallet.toString())
  if(tlValid.error) return tlValid
  const details = await service.w3valid.transactionDetails(txId)

  const senderAmount = details.meta.postBalances[0] - details.meta.preBalances[0]
  const receiverAmount = details.meta.postBalances[1] - details.meta.preBalances[1]
  
  return {sent: receiverAmount}
}

service.w3valid.moneyboy_balance = async (pubkey) => {
  const connection = ownerNet()
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

service.w3valid.validateSignup = async (txId, userId) => {
  let valid
  valid = await service.w3valid.validateTx(txId, userId)
  if(!valid) return {error: 'Error: Failed to validate tx'}
  if(valid.error) return valid
  if(valid.sent !== Cost.Signup) return {error: 'Error: Amount is incorrect'}
  return valid
}

service.w3valid.validatePost = async (txId, post) => {
  let valid
  //validate pubkey sent post cost
  valid = await service.w3valid.validateTx(txId, post.creator)
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

service.w3valid.validateLike = async (txId, postId, userId) => {
  let valid = true
  //validate this signature hasn't been processed before
  const status = await service.w3valid.validateSignatureCompletion('like', txId)
  if(status.error) return status
  //get post
  const post = await service.db.read(`/post/${postId}`)
  //validate pubkey sent post cost
  valid = await service.w3valid.validateTx(txId, userId)
  if(!valid) return {error: 'Error: Failed to validate tx'}
  if(valid.error) return valid
  if(valid.sent !== Cost.Like) return {error: 'Error: Amount is incorrect'}
  return {post}
}

service.w3valid.getOwner = async tokenPubkey => {
  const connection = ownerNet()
  const data = await connection.getTokenLargestAccounts(new sw3.PublicKey(tokenPubkey))
  const ownerTokenKey = data.value[0].address
  const parsedData = await connection.getParsedAccountInfo(ownerTokenKey)
  const owner = parsedData.value.data.parsed.info.owner
  return owner
}

module.exports = service.w3valid
