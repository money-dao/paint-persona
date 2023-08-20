const Buffer = require('buffer')
const { Metaplex, findMetadataPda, keypairIdentity, bundlrStorage } = require("@metaplex-foundation/js")
const solanaWeb3 = require("@solana/web3.js")
const splToken = require("@solana/spl-token")
const { GetProgramAccountsFilter, Keypair, Transaction, Connection, PublicKey } = require("@solana/web3.js")
const { AccountLayout, TOKEN_PROGRAM_ID, createTransferCheckedInstruction, getAssociatedTokenAddress} = require("@solana/spl-token")


const data = require('./data.js')

const MainNetBeta = 'https://api.mainnet-beta.solana.com'
const PaymentNet = 'https://api.metaplex.solana.com/'

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
    location.hash = '#hub'
    return resp.publicKey
  } catch (err) {
      // { code: 4001, message: 'User rejected the request.' }
  }
}

const toFixed = (num, fixed) => 
    num.toString().match(new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?'))[0];

const balance = async () => {
  const pubkey = data`pubkey`()
  const connection = new Connection(PaymentNet)
  const res = await connection.getBalance(pubkey)
  const value = res * 0.000000001
  const balance = toFixed(value, 4)
  data`balance`(balance)
  console.log(balance)
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
 
  data`nfts`(money)
  console.log(money)
}

module.exports = {
  connect, balance, moneyboy_balance
}
