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

const validateLike = async (txId, postId) => {
  const valid = true
  return valid
}

const validateSubscription = async (txId, mbPubkey) => {
  const valid = true
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
  const posts = await service.db.limit( `/profile/${mbPubkey}/post`, isOwner ? 10 : 3 )
  if(!posts) return []
  const postsAr = Object.values(posts)
  const loadedPosts = await Promise.all(postsAr.map(async postId => service.db.read(`/post/${postId}`)))
  return loadedPosts
}

service.web3.like = async (txId, postId) => {
  const valid = validateLike(txId, postId)
  let likes = await service.db.read(`/post/${postId}/likes`)
  likes = likes || 0
  likes++
  service.db.write(`/post/${postId}/likes`, likes)
  return {likes}
}

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