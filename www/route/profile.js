const el = require('../el/_el.js')
const data = require('../service/data.js')
const http = require('../service/http.js')
const event = require('../service/event.js')
const profileNotFound = require('./profilenotfound.js')

module.exports = () => {
  
  const profile = data`profile`()
  if(!profile) return profileNotFound()
  const pubkey = data`pubkey`()

  const getIsOwned = () => {
    const nfts = data`nfts`()
    const accounts = [...nfts.boys, ...nfts.girls]
    const mbPubkey = profile.nft.address.toString()
    return accounts.find(nft => mbPubkey == nft.address.toString())
  }
  const isOwned = getIsOwned()

  const getProfiles = async () => { 
    const posts = await http.post('loadprofile', {
      userPubkey: pubkey.toString(), 
      mbPubkey: profile.nft.address.toString()
    })
    const postsDiv = document.getElementById('profile-posts')
    postsDiv.innerHTML = ''
    if(posts.length)
      posts.forEach(post => event.append(postsDiv, el.post(post)))
    else
      postsDiv.innerHTML = `<h1 class="white-text">No posts yet...</h1>`
  }
  getProfiles()

  const clipboard = val => navigator.clipboard.writeText(val)
  const copyId = event.click(() => clipboard(profile.nft.address.toString()))
  
  return el.nav(
    el.route(  
      el.row(
        el.col('s12 m3',
          el.mb_card(profile, false), 
          isOwned ? `
              <a class="waves-effect waves-light btn col s12 deep-purple lighten-2" href="#browse">Browse</a>
              <a class="waves-effect waves-light btn col s12 deep-purple lighten-2" href="#post">Post</a>
            ` : `
              <a class="waves-effect waves-light btn col s12 deep-purple lighten-2" href="#hub">Hub</a>
            `,
          `
            <a class="waves-effect waves-light btn col s12 deep-purple lighten-2" href="https://www.tensor.trade/item/${profile.nft.address.toString()}" target="_blank">Tensor</a>
            <a class="waves-effect waves-light btn col s12 deep-purple lighten-2" id="${copyId}">Copy ID</a>
          `
        ),        
        el.col('s12 m9', `
          <div id="profile-posts" class="flex-center flex-wrap browse-feed"></div>
        `)
      )
    )
  )
}