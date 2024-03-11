const Buffer = require('buffer')
const { Metaplex, findMetadataPda, keypairIdentity, bundlrStorage } = require("@metaplex-foundation/js")
const solanaWeb3 = require("@solana/web3.js")
const splToken = require("@solana/spl-token")
const { GetProgramAccountsFilter, Keypair, Transaction, Connection, PublicKey } = require("@solana/web3.js")
const { AccountLayout, TOKEN_PROGRAM_ID, createTransferCheckedInstruction, getAssociatedTokenAddress} = require("@solana/spl-token")

const data = require('./data.js')
const http = require('./http.js')
const db = require('./db.js')

const MainNetBeta = 'https://api.mainnet-beta.solana.com'
const PaymentNet = 'https://api.metaplex.solana.com/'
const ToddLewisWallet = new PublicKey('24ufyLS4jMkAxoUk8pPgWnournhPVfoM2Vm5PdpVJS4r')
const MoneyDAO = new PublicKey('9buedT3QphNyZ9Yx2xMadQjSEAaLDdTJf1cY5ZJJJp8W')
const PaintPersona = new PublicKey('FDgSCwGfSALw5Z8Sv98jrKH49e1jnmstZi3NFv4MBqSA')

const Cost = {
  Post: 30,
  Like: 6,
  DiamondBattle: 6,
  Subscribe: 300,
  Signup: 1000
}

const get_provider = () => {
  if ('phantom' in window) {
    const provider = window.phantom?.solana

    if (provider?.isPhantom) {
      return provider
    }
  }

  window.open('https://phantom.app/', '_blank')
}

const connect = async () => {  
  const provider = get_provider()
  try {
    const resp = await provider.connect()
    console.log(resp.publicKey.toString())
    data`pubkey`(resp.publicKey)
    data`connected`(true)
    await balance()
    await moneyboy_balance()
    await getQue()
    location.hash = '#battle'
    return resp.publicKey
  } catch (err) {
      // { code: 4001, message: 'User rejected the request.' }
  }
}

const toFixed = (num, fixed) => 
    num.toString().match(new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?'))[0];

const getQue = async () => {
  const userId = data`pubkey`().toString()
  const que = await db.get(`diamondbattle/que/${userId}`)
  data`que`(que || {})
}

const balance = async () => {
  const pubkey = data`pubkey`()
  const connection = new Connection(PaymentNet)
  const res = await connection.getBalance(pubkey)
  const value = res * 0.000000001
  const balance = toFixed(value, 3)
  data`balance`(balance)
  console.log(balance)
}

const get_nfts = async (...ids) => {
  const connection = new Connection(PaymentNet)
  const wallet = data`pubkey`()

  const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(wallet))
      .use(bundlrStorage())

  ids = ids.map(id => new solanaWeb3.PublicKey(id))
  const nfts = await metaplex.nfts().findAllByMintList({ mints: ids })

  let res = {}
  await Promise.all(nfts.map(async nft => {
    const meta = await fetch(nft.uri)
    const json = await meta.json()
    json.address = nft.mintAddress
    res[json.address.toString()] = json
  }))
  return res
}

const moneyboy_balance = async () => {
  const connection = new Connection(PaymentNet)
  const wallet = data`pubkey`()

  const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(wallet))
      .use(bundlrStorage())
  
  console.log("getting moneyboy_balance...", wallet)
  const tokenAccounts = await connection.getTokenAccountsByOwner(
      wallet, {programId: TOKEN_PROGRAM_ID}
  )
  let mints = []
  tokenAccounts.value.forEach(tokenAccount => {
    const accountData = AccountLayout.decode(tokenAccount.account.data);
    if(accountData.amount == 1){
      const mintAddress = new PublicKey(accountData.mint)
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

  const accounts = [...money.boys, ...money.girls]
  const mbAr = accounts.map(nft => nft.address.toString())
  // const revenue = await http.post('loadrevenue', {mbAr})
  // accounts.forEach(nft => nft.revenue = revenue[nft.address.toString()])
 
  data`nfts`(money)
  console.log(money)
}

const send_tx = async (amount, to) => {
  if(!to) to = PaintPersona
  const from = data`pubkey`()
  const provider = get_provider()
  const connection = new Connection(PaymentNet)
  const lamports = (solanaWeb3.LAMPORTS_PER_SOL * 0.001) * amount
  console.log(amount * 0.001)
  const transaction = new solanaWeb3.Transaction().add(
    solanaWeb3.SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: to,
      lamports
    })
  )
  let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
  transaction.recentBlockhash = blockhash
  transaction.feePayer = from

  // Sign transaction, broadcast, and confirm
  const { signature } = await provider.signAndSendTransaction(transaction)
  let status
  await count_blocks(transaction, async () => {
    status =  await connection.getSignatureStatus(signature)
    console.log('loading...', status.value)
    if(status.value && status.value.confirmationStatus === 'finalized')
      return true
    return false
  })
  console.log('SIGNATURE', signature, status)
  return signature
}

const ppATA = nft => splToken.getAssociatedTokenAddress(nft, PaintPersona)

const check_nft_account = async (toATA) => {
  const connection = new Connection(PaymentNet)
  try {
    const account = await splToken.getAccount(
      connection,
      toATA,
      "confirmed",
      TOKEN_PROGRAM_ID
    )

    return account
  } catch (thrownObject) {
    
  }
}

const create_nft_account = async (nft, to) => {
  if(!to) to = PaintPersona
  const from = data`pubkey`()
  const provider = get_provider()
  const connection = new Connection(PaymentNet)
  const toATA = await splToken.getAssociatedTokenAddress(nft, to)
  console.log(toATA.toString())
  const checkAccount = await check_nft_account(toATA)
  if(checkAccount) return {signature: null, toATA}
  const transaction = new solanaWeb3.Transaction()
  transaction.add(splToken.createAssociatedTokenAccountInstruction(
    from,
    toATA,
    to,
    nft,
    splToken.TOKEN_PROGRAM_ID,
    splToken.ASSOCIATED_TOKEN_PROGRAM_ID
  ))
  let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
  transaction.recentBlockhash = blockhash
  transaction.feePayer = from

  console.log('tx', transaction)
  // Sign transaction, broadcast, and confirm
  const { signature } = await provider.signAndSendTransaction(transaction)
  let status
  await count_blocks(transaction, async () => {
    status =  await connection.getSignatureStatus(signature)
    console.log('loading...', status.value)
    if(status.value && status.value.confirmationStatus === 'finalized')
      return true
    return false
  })
  console.log('SIGNATURE', signature, status)
  return {signature, toATA}
}

const nft_tx = async (nft, amount, to) => {
  if(!to) to = PaintPersona
  const from = data`pubkey`()
  const provider = get_provider()
  const createATASignature = await create_nft_account(nft, to)
  const connection = new Connection(PaymentNet)
  const transaction = new solanaWeb3.Transaction()
  const fromATA = await splToken.getAssociatedTokenAddress(nft, from)
  console.log(from, to, nft, fromATA, createATASignature.toATA)
  const lamports = (solanaWeb3.LAMPORTS_PER_SOL * 0.001) * amount
  transaction.add(
    solanaWeb3.SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: to,
      lamports
    })
  )
  transaction.add(
    splToken.createTransferInstruction(
      fromATA,
      createATASignature.toATA,
      from,
      1,
      [],
      splToken.TOKEN_PROGRAM_ID
    )
  )
  let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
  transaction.recentBlockhash = blockhash
  transaction.feePayer = from

  console.log('tx', transaction)
  // Sign transaction, broadcast, and confirm
  const { signature } = await provider.signAndSendTransaction(transaction)
  let status
  await count_blocks(transaction, async () => {
    status =  await connection.getSignatureStatus(signature)
    let txStatus = data`tx_status`() || {}
    txStatus[nft.toString()] = status.value
    data`tx_status`(txStatus)
    const txCount = document.body.querySelector(`.${nft.toString()} .count`)
    if(txCount){
      console.log(txCount)
    } else {
      console.log('Err: Couldnt find txCount')
    }
    console.log('loading...', txStatus)
    if(status.value && status.value.confirmationStatus === 'finalized')
      return true
    return false
  })
  console.log('SIGNATURE', signature, status)
  return {signature, createATASignature, transaction}
}
 
const count_blocks = async (transaction, condition) => {
  const network = PaymentNet
  const connection = new solanaWeb3.Connection(network)
  let latestBlockhash = transaction.recentBlockhash
  data`loading`(true)
  return new Promise(res => {
    const i = setInterval(async () => {
      let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash
      if(latestBlockhash != blockhash){
        latestBlockhash = blockhash
        if(await condition()) {
          clearInterval(i)
          data`loading`(false)
          res()
        }
      }   
    }, 1250)
  })
}

// window.nftfn = sk => solanaWeb3.Keypair.fromSecretKey(Uint8Array.from(sk)).publicKey.toString()
module.exports = {
  connect, balance, moneyboy_balance, send_tx, nft_tx, Cost, get_nfts, ppATA, check_nft_account
}
