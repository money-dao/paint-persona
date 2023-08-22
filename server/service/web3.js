const service = require('./service.js')
service.web3 = {}

const validateOwnership = async (userPubkey, mbPubkey) => {
  //validate user owns mb
  return true
}

const validateTx = async (txId, userPubkey) => {
  //validate pubkey sent finished tx
  return true
}

const validatePost = async (txId, post) => {
  let valid = true
  //validate pubkey owns mbkey
  valid = await validateOwnership(post.creator, post.mb.key)
  if(!valid) return {error: 'Error: Post creator is not the owner of mb'}
  //validate pubkey sent post cost
  valid = await validateTx(txId, post.creator)
  if(!valid) return {error: 'Error: Failed to validate tx'}
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
  const isOwner = await validateOwnership(userPubkey, mbPubkey)
  const posts = await service.db.limit( `profile/${mbPubkey}/post`, isOwner ? 10 : 3 )
  if(!posts) return []
  const postsAr = Object.values(posts)
  const loadedPosts = await Promise.all(postsAr.map(async postId => service.db.read(`/post/${postId}`)))
  return loadedPosts
}

module.exports = {}