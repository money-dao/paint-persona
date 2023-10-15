# Paint Persona

## Requirements to run:

1. Create a test firebase Realtime Database
2. Create a Solana web3 Keypair (this will be your local PaintPersonaWallet)

* `/www/service/db_key.js`
  * export Firebase config object
* `/server/asset/fbkey.js`
  * export Firebase Admin SDK private key
* `/server/service/db.js`
  * change databaseURL to firebase database url
* `/server/asset/tls-main.js`
  * export solana web3 Keypair object
* `/server/service/web3.js`
  * change `PaintPersonaWallet` pubkey to your local PaintPersonaWallet pubkey
* `/web/service/w3.js`
  * change `PaintPersona` pubkey to your local PaintPersonaWallet pubkey

## To run:
* npm i
* npm run refresh
* http://localhost:4200

## To Build prod:
* webpack.config.js remove `mode: 'development'`
* webpack.frontend.js remove `mode: 'development'`
* mode.js export true

## Hackathon TODOs:
* fix mobile phantom not working
* raffle MB for likes
* styling
  * signup page

## Shortcuts:
* npm run frontend (will only build frontend)
* npm run server (will only build backend)
* npm run serve (will only build backend and start server)
