const firebaseConfig = require('./db_key.js')

const { initializeApp } = require("firebase/app")
const { getDatabase, ref, set, onValue } = require("firebase/database")
const { getAnalytics } = require("firebase/analytics")

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)

const write = (location, obj) => {
  console.log(location, obj)
  const db = getDatabase()
  set(ref(db, location), obj)
}

const read = (location, fn, loop) => {
  const db = getDatabase()
  onValue(ref(db, location), (snapshot) => fn(snapshot.val()), {
    onlyOnce: !loop
  })
}

module.exports = {
  read, write
}
