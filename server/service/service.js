const tk = require('tls-toolkit')
const Buffer = require('buffer') // unused but you GOTTA keep it here :)
const keys = require('../asset/keys.js')
tk.setProd(true)
tk.setKeys(keys)

module.exports = {
  tk,
  validate: tk.validate,
  db: tk.db,
  nft: tk.nft,
  data: tk.data
}
