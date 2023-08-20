const data = require('../service/data.js')
const event = require('../service/event.js')
const w3 = require('../service/w3.js')

const nav = route => {
  let pubkey = data`pubkey`()
  let wallet = pubkey ? pubkey.toString() : undefined
  let balance = data`balance`()

  const refresh = () => event.fn(() => {
    pubkey = data`pubkey`()
    wallet = pubkey ? pubkey.toString() : undefined
    balance = data`balance`()
    console.log('refresh', balance)
    document.getElementById('wallet').innerHTML = wallet ? wallet.substring(0, 6) : 'Persona'
    if(!pubkey){
      document.getElementById('balance').classList.add('hide')
      document.getElementById('balance').innerText = ''
      document.getElementById('connect').classList.remove('hide')
    } else {
      document.getElementById('balance').classList.remove('hide')
      document.getElementById('balance').innerText = balance + ' sol'
      document.getElementById('connect').classList.add('hide')
    }
  })
  
  const connectId = event.el(el => {
    el.addEventListener('click', async () => {
      await w3.connect()
      refresh()
    })
  })
  
  return `
    <nav>
      <div class="nav-wrapper">
        <a id="wallet" href="#hub" class="brand-logo">${wallet ? wallet.substring(0, 6) : 'Persona'}</a>
        <ul id="nav-mobile" class="right">
          <li id="balance" class="${balance ? '' : 'hide'}"><a>${balance} sol</a></li>
          <li id="connect" class="${pubkey ? 'hide' : ''}"><a id="${connectId}">Connect Wallet</a></li>
        </ul>
      </div>
    </nav>
    ${route}    
  ` 
}
module.exports = nav