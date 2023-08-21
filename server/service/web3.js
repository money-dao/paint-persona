const service = require('./service.js')
service.web3 = {}

const validatePost = async (txId, pubkey, post) => {
  //validate pubkey owns mbkey
  //validate pubkey sent post cost
  //validate post has 9 swag
  //validate swag text length
  return true
}

service.web3.post = async (txId, pubkey, post) => {
  const valid = validatePost(txId, pubkey, post)
  if(valid){
    console.log(`post [${post.mbKey}]`)
    service.db.write(`/profile/${post.mbKey}/post/${post.id}`, post.time)
    service.db.write(`/post/${post.id}`, post)
    return {msg: 'done'}
  }
  return {error: valid}
}

module.exports = {}