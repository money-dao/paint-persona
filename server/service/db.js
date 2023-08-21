const service = require('./service.js')
const admin = require("firebase-admin")
const { getDatabase } = require('firebase-admin/database')

const serviceAccount = require('../asset/fbkey.js')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://paint-persona-default-rtdb.firebaseio.com"
})

service.db = {}

service.db.write = (location, obj) => {
  const db = getDatabase()
  const ref = db.ref(location)
  return ref.set(obj)
}

service.db.push = (location, obj) => {
  const db = getDatabase()
  const ref = db.ref(location).push()
  return ref.set(obj)
}

service.db.read = (location, fn) => {
  const db = getDatabase()
  const ref = db.ref(location)

  ref.on('value', 
    (snapshot) => fn(snapshot.val()), 
    (errorObject) =>  console.error('The read failed: ' + errorObject.name) 
  )
}

module.exports = {}